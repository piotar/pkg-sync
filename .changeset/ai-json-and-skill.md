---
"@piotar/pkg-sync": minor
---

Make pkg-sync usable by AI agents and automation.

- Add `--json` to every command, printing a single structured JSON object on stdout.
- Establish a clean output contract: stdout carries data only; diagnostics, progress and the update notice go to stderr. Errors are `{"error": "<message>"}` on stderr under `--json` (exit code 1).
- Harden non-interactive use: interactive prompts now require a TTY and are skipped in JSON mode.
- Ship a `SKILL.md` (agentskills.io format) documenting when and how to drive the CLI, plus a "Using from automation / AI agents" section in the README.
