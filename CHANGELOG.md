# @piotar/pkg-sync

## 2.1.0

### Minor Changes

- c29c2e4: Make pkg-sync usable by AI agents and automation.

  - Add `--json` to every command, printing a single structured JSON object on stdout.
  - Establish a clean output contract: stdout carries data only; diagnostics, progress and the update notice go to stderr. Errors are `{"error": "<message>"}` on stderr under `--json` (exit code 1).
  - Harden non-interactive use: interactive prompts now require a TTY and are skipped in JSON mode.
  - Ship a `SKILL.md` (agentskills.io format) documenting when and how to drive the CLI, plus a "Using from automation / AI agents" section in the README.

## 2.0.3

### Patch Changes

- Internal refactor to mirror the skillmesh project; no command or flag changes.

  - CLI migrated from commander to citty, prompts to @clack/prompts, and chalk to a small built-in ANSI helper (picomatch kept).
  - Build/test/lint moved to Bun: `bun build` (Node-targeted bundle), `bun test`, and ESLint flat config with typescript-eslint; tsconfig extends @tsconfig/bun.
  - Code rewritten in a smaller-function, short-comment style with bun tests for the pure logic.
  - CI: PR workflow running typecheck/lint/test/build; npm publish via OIDC trusted publishing (no token); changesets added for version + changelog management.
