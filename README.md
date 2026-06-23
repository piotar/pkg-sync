# pkg-sync

[![GitHub package.json version](https://img.shields.io/github/package-json/v/piotar/pkg-sync)](https://github.com/piotar/pkg-sync)
[![npm (scoped)](https://img.shields.io/npm/v/@piotar/pkg-sync)](https://www.npmjs.com/package/@piotar/pkg-sync)
![node-current (scoped)](https://img.shields.io/node/v/@piotar/pkg-sync)
![NPM](https://img.shields.io/npm/l/@piotar/pkg-sync)

Develop a local package and see it live in another project — **without symlinks and without touching any `package.json`**.

`pkg-sync` watches a package's build output and copies it straight into the consuming project's `node_modules`, so the project sees it exactly as if it were installed from the registry.

## Why not `npm link`?

`npm link` creates a symlink, and symlinks break in many real-world setups: bundlers resolving a dependency twice (duplicate React, hooks errors), `peerDependencies` resolved from the wrong tree, tools that don't follow symlinks, and Windows quirks. Publishing to a registry on every change is too slow for tight feedback loops.

`pkg-sync` avoids all of that by copying **real files** into `node_modules/<package>`. Nothing in the consuming project changes — no symlink, no edited `package.json`, no lockfile churn — so the dependency behaves like a normal install.

## How it works

- You **register** a package once by its path. Its name and location are stored in a global registry at `~/.pkg-sync/data.json`.
- On **`sync`**, `pkg-sync` reads the target project's `package.json`, resolves its dependency tree up to a configurable **depth** (default `2`), and intersects it with the registered packages. Every match is mirrored from its source into the project's `node_modules`.
- Only relevant files are copied: by default the `dist`, `lib`, `build` and `src` directories, minus common noise (VCS folders, lockfiles, editor files). A package can override which directories are watched.
- With watching enabled (the default), changes in a source package are debounced and re-copied automatically, giving a live local feedback loop.

## Installation

```sh
npm install -g @piotar/pkg-sync
```

Requires Node.js >= 22.

## Usage

We have a main project (`App`) and 2 dependencies (`Ui` and `Store`) in different locations (this is **not** a monorepo):

```
~
├── projects
│   └── App
│       ├── node_modules
│       ├── package.json
│       └── etc...
└── external
    ├── Ui
    │   ├── node_modules
    │   ├── package.json
    │   └── etc...
    └── Store
        ├── node_modules
        ├── package.json
        └── etc...
```

1. Register each dependency — from `~/external/Ui` and `~/external/Store` run `pkg-sync add .` (`.` resolves the name from the closest `package.json`).
2. From `~/projects/App` run `pkg-sync sync .` — this copies the dependency files into `App/node_modules` and starts watching for changes.

That's it. Step 1 is only needed the first time; afterwards a single `pkg-sync sync .` is enough.

### Configuration

Settings live in the same global registry and are managed with `pkg-sync config`:

- `pkg-sync config get` — print all settings.
- `pkg-sync config set depth 3` — how deep the dependency tree is searched during `sync`/`validate` (values are parsed as JSON).
- `pkg-sync config restore` — reset to defaults.

To watch non-default directories for a specific package, pass them when registering: `pkg-sync add . -d dist,types`.

> Colored output honors the `NO_COLOR` environment variable and is disabled automatically when output is not a TTY.

# Commands

Run `pkg-sync <command> --help` for the full, up-to-date options of any command.

### `add [path]`

Register a package so it can be synced. `path` defaults to the closest `package.json`.

- `-n, --name <name>` — override the package name (instead of the one in `package.json`)
- `-f, --force` — overwrite an existing registration
- `-d, --dir <dirs>` — comma-separated directories to watch, overriding the defaults

### `remove [packages...]` (alias `rm`)

Unregister packages. Use `.` for the name in the closest `package.json`.

- `-i, --interactive` — pick packages to remove from a list
- `-a, --all` — remove every registered package

### `list` (alias `ls`)

Show the data file path, the default watch directories, and every registered package.

### `validate [path]`

Preview which registered packages would be synced for a project, without copying anything.

- `-d, --depth <n>` — dependency search depth (default `2`)

### `sync [path] [packages...]`

Copy registered dependencies into a project's `node_modules` and watch for changes. Pass package names to limit the sync to a subset.

- `--no-watch` — copy once and exit instead of watching
- `-i, --interactive` — pick packages to sync from a list
- `-d, --depth <n>` — dependency search depth (default `2`)

### `config <set|get|restore>`

Manage stored settings.

- `config set <key> <value>` — set a value, parsed as JSON (e.g. `config set depth 3`)
- `config get [key]` — print one value, or all settings when no key is given
- `config restore` — reset the config to defaults

### `update-check`

Check npm for a newer version of pkg-sync.
