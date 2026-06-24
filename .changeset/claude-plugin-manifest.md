---
"@piotar/pkg-sync": minor
---

Ship a Claude Code plugin manifest (`.claude-plugin/plugin.json`) that exposes the bundled `SKILL.md` as a `pkg-sync` skill, so the package can be loaded directly with `claude --plugin-dir node_modules/@piotar/pkg-sync` (or symlinked into `~/.claude/skills`). The manifest is now published with the package, and the README documents how to wire it up.
