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

### Useful commands

- `pkg-sync list` — show every registered package, the data file path, and the default watch directories.
- `pkg-sync validate .` — preview which registered packages would be synced for a project, without copying anything.
- `pkg-sync sync . --no-watch` — copy once and exit, instead of watching.
- `pkg-sync sync . -i` — pick the packages to sync interactively.
- `pkg-sync remove <name>` / `pkg-sync remove -i` — unregister packages.

### Configuration

Settings live in the same global registry and are managed with `pkg-sync config`:

- `pkg-sync config get` — print all settings.
- `pkg-sync config set depth 3` — how deep the dependency tree is searched during `sync`/`validate` (values are parsed as JSON).
- `pkg-sync config restore` — reset to defaults.

To watch non-default directories for a specific package, pass them when registering: `pkg-sync add . -d dist,types`.

> Colored output honors the `NO_COLOR` environment variable and is disabled automatically when output is not a TTY.

# Commands

## add

```console
Add package to sync (pkg-sync add v2.0.3)

USAGE pkg-sync add [OPTIONS] [PATH]

ARGUMENTS

  PATH    Path to package (path not set will be set to closest package.json)

OPTIONS

  -n, --name=<name>    Package name (override name from package.json)           
        -f, --force    Override package (Default: false)              
    -d, --dir=<dir>    Directories to watch, comma-separated (override defaults)

```

## remove

```console
Remove package from sync (pkg-sync remove v2.0.3)

USAGE pkg-sync remove [OPTIONS] [PACKAGES]

ARGUMENTS

  PACKAGES    Package name (use "." for the closest package.json)

OPTIONS

  -i, --interactive    Interactive mode (Default: false)          
          -a, --all    Remove all stored packages (Default: false)

```

## list

```console
Show all stored packages (pkg-sync list v2.0.3)

USAGE pkg-sync list 

```

## validate

```console
Show coverage packages from project (pkg-sync validate v2.0.3)

USAGE pkg-sync validate [OPTIONS] [PATH]

ARGUMENTS

  PATH    Path to package (path not set will be set to closest package.json)

OPTIONS

  -d, --depth=<depth>    Deep search of dependencies (Default: 2)

```

## sync

```console
Sync and watch packages in project (pkg-sync sync v2.0.3)

USAGE pkg-sync sync [OPTIONS] [PATH]

ARGUMENTS

  PATH    Path to package (path not set will be set to closest package.json)

OPTIONS

              --watch    Watch files after sync (Default: true)  
           --no-watch    Disable watch files after sync                    
    -i, --interactive    Interactive mode (Default: false)       
  -d, --depth=<depth>    Deep search of dependencies (Default: 2)

```

## update-check

```console
Check version of 'pkg-sync' (pkg-sync update-check v2.0.3)

USAGE pkg-sync update-check 

```

## config

```console
Config (pkg-sync config v2.0.3)

USAGE pkg-sync config set|get|restore

COMMANDS

      set    Set config               
      get    Get config               
  restore    Restore config to default

Use pkg-sync config <command> --help for more information about a command.
```
