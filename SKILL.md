---
name: pkg-sync
description: Use the pkg-sync CLI to mirror a locally-developed npm package into another project's node_modules (no symlinks, no package.json edits) when testing unpublished local changes across separate repos.
license: MIT
metadata:
  homepage: https://github.com/piotar/pkg-sync
  command: pkg-sync
---

# pkg-sync

`pkg-sync` copies a locally-developed package's build output into another project's
`node_modules/<name>`, so the project uses your local changes as if installed from npm — without
symlinks and without editing any `package.json`. Prefer it over `npm link` when symlinks cause
trouble (duplicate React/hooks, wrong `peerDependencies` resolution, tools that don't follow links).

## When to use

- A user is developing library `A` and wants to test it inside app `B` that lives in a different repo.
- `npm link` is flaky or off the table and publishing on every change is too slow.

## Output & exit-code contract (read this before parsing)

- Pass `--json` to any command to get a single JSON object on **stdout**. Always use it when you
  need to read the result.
- **stdout = data only**; all diagnostics/progress/notices go to **stderr**. Parse stdout, ignore
  stderr (or capture it separately).
- Exit code `0` = success, `1` = error. Under `--json`, errors are `{"error": "<message>"}` on stderr.

## Rules for agents

- **Never start the watcher** — bare `sync` watches forever and never returns. Always pass `--no-watch`.
- **Don't use `-i`/`--interactive`** — it needs a TTY. Pass package names / paths explicitly instead.
- **`unsync` reinstalls by default** (runs the project's package manager — network + time). Pass `--no-reinstall` for a deterministic, offline cleanup and restore the dependency yourself.
- State is global, per-user (`~/.pkg-sync/data.json`); registering a package persists across projects.

## Recipes

Register the local package (run in its directory, or pass its path):

```sh
pkg-sync add /path/to/library --json
# custom watch dirs (default: dist,lib,build,src):
pkg-sync add /path/to/library -d dist,types --json
```

Preview what would sync into a project, then sync once:

```sh
pkg-sync validate /path/to/app --json     # { "packages": ["library"] }
pkg-sync sync /path/to/app --no-watch --json   # { "synced": ["library"], "watch": false }
```

Inspect and clean up:

```sh
pkg-sync list --json                       # { dataFile, defaultWatchDirs, packages: [...] }
pkg-sync status --json                     # { "targets": [{ path, packages, syncedAt, stale }] }
pkg-sync remove library --json             # { "removed": ["library"], "missing": [] }
pkg-sync config get --json                 # { "depth": 2 }
pkg-sync config set depth 3 --json         # value is parsed as JSON
```

Undo a sync — remove the synced files and restore the published versions:

```sh
pkg-sync unsync /path/to/app --json        # { "unsynced": ["library"], "reinstalled": true }
# offline / deterministic: skip the package-manager reinstall and restore it yourself
pkg-sync unsync /path/to/app --no-reinstall --json   # { "unsynced": ["library"], "reinstalled": false }
```

`--depth <n>` (on `sync`/`validate`) controls how deep the dependency tree is searched (default `2`).
