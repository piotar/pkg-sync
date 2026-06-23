---
"@piotar/pkg-sync": patch
---

Prettier CLI output: route human-mode messages through `@clack/prompts` (framed `list`, boxed notes for `config`/`validate`/`sync`, colored success/warn/error logs) instead of raw `console.log`. JSON mode and the stdout/stderr contract are unchanged; the swallowed update-check error now goes to stderr instead of polluting stdout.
