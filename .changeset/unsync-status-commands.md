---
"@piotar/pkg-sync": minor
---

Add `unsync` (alias `restore`) and `status` commands.

`sync` now records each active sync in the registry (`targets` in `~/.pkg-sync/data.json`). `status` reports which packages are synced into which projects (flagging stale targets whose `node_modules` is gone), and `unsync` removes the synced files and restores the published versions via the project's package manager (`--no-reinstall` to skip). The core `SyncWatcher` copy/watch engine is now covered by unit tests.
