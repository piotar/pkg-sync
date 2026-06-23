# @piotar/pkg-sync

## 2.0.3

### Patch Changes

- Internal refactor to mirror the skillmesh project; no command or flag changes.

  - CLI migrated from commander to citty, prompts to @clack/prompts, and chalk to a small built-in ANSI helper (picomatch kept).
  - Build/test/lint moved to Bun: `bun build` (Node-targeted bundle), `bun test`, and ESLint flat config with typescript-eslint; tsconfig extends @tsconfig/bun.
  - Code rewritten in a smaller-function, short-comment style with bun tests for the pure logic.
  - CI: PR workflow running typecheck/lint/test/build; npm publish via OIDC trusted publishing (no token); changesets added for version + changelog management.
