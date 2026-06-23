# AGENTS.md

Guidance for AI agents working in this repo. Read this first instead of re-discovering the project each session.

## What this is

**pkg-sync** — a developer CLI that mirrors a locally-developed package into another project's `node_modules`, **without symlinks and without editing any `package.json`**. It is an alternative to `npm link`: you register a package once by its path, then `sync` copies its build output (real files) into the consuming project so the dependency behaves like a normal install, optionally watching for live updates.

`package.json` name is `@piotar/pkg-sync`; the bin is `pkg-sync`. All state lives in a global registry at `~/.pkg-sync/data.json` — nothing is written into the projects being synced.

## Runtime: Node + Bun

The shipped CLI targets **Node (≥22)**; development is done with **Bun**. Distribution is a single bundled file that runs under Node.

- **Dev:** `bun run ./src/cli.ts <cmd>` (or `bun run pkg-sync <cmd>`). The source entry keeps the `#!/usr/bin/env bun` shebang.
- **Build:** `bun run build` → `scripts/build.ts` uses `Bun.build({ target: "node" })` to bundle `src/cli.ts` into `dist/cli.js`, rewrites the shebang to `#!/usr/bin/env node`, and chmods it. `package.json` `bin` points at `dist/cli.js`; `files` ships `dist` + `README.md`. Because the bundle is self-contained, all third-party deps live in `devDependencies`.
- **Tests are Bun-only** (`bun:test`). That's fine — tests are dev-only and never shipped.

## Commands

```bash
bun install
bun run pkg-sync <cmd>     # run the CLI without linking (dev)

bun run build              # bundle to dist/cli.js (Node-runnable)
node ./dist/cli.js <cmd>   # run the built CLI under Node

bun test                   # full test suite (bun:test)
bun run typecheck          # tsc --noEmit
bun run lint               # eslint
```

CLI subcommands: `add`, `remove` (`rm`), `list` (`ls`), `validate`, `sync`, `config` (`set`/`get`/`restore`), `update-check`. See `README.md` for flags.

## Architecture

Small, single-bin CLI organized by responsibility under `src/`:

- `src/cli.ts` — citty command tree + top-level error handling (clean one-liner; full stack only under `PKG_SYNC_DEBUG`). `--help`/`--version` go through `runMain`; normal dispatch through `runCommand`.
- `src/commands/*` — one `defineCommand` per command. `sharedArgs.ts` holds reusable arg fragments (`pathArg`, `depthArg`, `interactiveArg`) and `parseDepth`. Interactive prompts use `@clack/prompts` (`multiselect` + `isCancel`).
- `src/common/` — `appConfig.ts` (project name + `~/.pkg-sync` paths) and `watchRules.ts` (default include dirs, exclude globs, picomatch options).
- `src/models/` — `JsonFile` (Proxy-wrapped typed JSON file), `SyncWatcher` (the copy/watch engine), `ApplicationError`.
- `src/utils/` — package resolution and helpers (see below).

### Key modules

- **`models/JsonFile.ts`** — loads a JSON file and returns a `Proxy` so callers read/write data fields directly (`file.config`), while `$`-prefixed members (`$data`, `$save`, `$dirname`, `$fileExists`) expose the file itself. Backs both the registry and parsed `package.json` files.
- **`utils/getApplicationData.ts`** — the global registry (`~/.pkg-sync/data.json`): `{ version, updateCheck, packages, config }`. Loaded once as a singleton; `transform` merges stored data over defaults so new fields always have a value.
- **`utils/getPackageJson.ts`** — loads a `package.json`, cached by real path; `$dependencies` (a `Set` merged from deps/devDeps/peerDeps) is computed on access via a Proxy.
- **`utils/getDependencies.ts` / `getRelatedDependencies.ts`** — resolve a project's dependency tree to a given **depth** (deduplicated via `findPackage` walking `node_modules`), then intersect with registered packages — these are what `sync`/`validate` operate on.
- **`models/SyncWatcher.ts`** — extends `Set<string>`; `copy()` does a one-shot sync, `watch()` mirrors changes with a 600ms debounce. Filters paths through picomatch include/exclude matchers; refuses to sync a directory onto itself. Logs are prefixed with the package name in a stable color from `utils/textToRgb.ts`.
- **`utils/ansi.ts`** — tiny ANSI helper (replaces chalk). `rgb`/`green`/`yellow`; output is plain when `NO_COLOR` is set or stdout is not a TTY.

### Design invariants (don't break these)

- **Nothing but the synced files lands in the target project** — no symlink, no edited `package.json`, no lockfile change. Copies are real files into `node_modules/<name>`.
- All persistent state lives in `~/.pkg-sync/data.json` (resolved in `common/appConfig.ts`).
- `sync` and `validate` only act on the intersection of the project's resolved dependency tree and the registered packages — registering a package does not by itself copy anything.

## Conventions

- TypeScript strict via `@tsconfig/bun`: `verbatimModuleSyntax` is on → use `import type` for types; `noUncheckedIndexedAccess` is on → handle `T | undefined` from index access (e.g. `appData.packages[name]`).
- ESM (`"type": "module"`); imports are **extensionless** (bundler/Bun resolution), not `.js`.
- Style mirrors the sibling **skillmesh** project: small functions, a short English `/** ... */` comment per function/module, one main export plus helpers per file. Match the existing comment density.
- Tests live next to source as `*.test.ts` and exercise pure logic (see `utils/*.test.ts`, `models/JsonFile.test.ts`); use throwaway `mkdtemp` dirs with `afterAll` cleanup for fs-touching tests.
- Avoid `*/` inside JSDoc (e.g. when documenting globs) — it closes the comment early.

## Release & CI

- **Versioning:** changesets. Add a changeset per change (`bun run changeset`); at release time `bun run version-packages` bumps `package.json` and writes `CHANGELOG.md`, consuming the changesets.
- **CI** (`.github/workflows/ci.yml`): typecheck + lint + test + build on pull requests and pushes to `main`.
- **Publish** (`.github/workflows/npm-publish.yml`): triggered by creating a **GitHub Release** (tag `vX.Y.Z`). Publishes to npm via **OIDC trusted publishing** (no token; provenance is automatic). Requires a trusted publisher configured for the package on npmjs.com (repo `piotar/pkg-sync`, workflow `npm-publish.yml`).
- The release flow is **manual**: bump via changesets → commit → create the GitHub Release.

> The `README.md` "# Commands" section is maintained by hand (the old `doc` auto-generator was removed). Keep it in sync when adding or changing commands/flags.
