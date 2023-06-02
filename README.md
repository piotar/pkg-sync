# pkg-sync

[![GitHub package.json version](https://img.shields.io/github/package-json/v/piotar/pkg-sync)](https://github.com/piotar/pkg-sync)
[![npm (scoped)](https://img.shields.io/npm/v/@piotar/pkg-sync)](https://www.npmjs.com/package/@piotar/pkg-sync)
![node-current (scoped)](https://img.shields.io/node/v/@piotar/pkg-sync)
![Snyk Vulnerabilities for npm scoped package](https://img.shields.io/snyk/vulnerabilities/npm/@piotar/pkg-sync)
![NPM](https://img.shields.io/npm/l/@piotar/pkg-sync)

A utility for synchronization multiple packages, without any symlinks and any changes in source projects(package.json, etc.).

It is a simple application to **watching and copying files** from project to another project using CLI.

# Installation


```sh
npm install -g @piotar/pkg-sync
```

# Usage

In some cases, we can not use symbolic links for dependencies. The solution is to copy build files to our project and test it locally. 

## Example

We have a main project (`App`) and 2 dependencies (`Ui` and `Store`) with difference locations (this is not monorepository).

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

First of all, we need to add dependencies to `pkg-sync`.

1. Go to directories `~/external/Ui` and `~/external/Store`.
2. Run command `pkg-sync add .`  with each directory.
3. Go to `~/projects/App` directory.
4. Run command `pkg-sync sync .`. This will copy dependency files and start watching for changes.

That's it... Points 1-2 are only necessary for the first run.

# Commands

## add [options] [path]

```console
Usage: pkg-sync add [options] [path]

Add package to sync

Arguments:
  path                  Path to package (path not set will be set to closest package.json)

Options:
  -n, --name <package>  Package name (override name from package.json)
  -f, --force           Override package
  -d, --dir [dirs...]   Directory to watch (override default values)
  -h, --help            display help for command

```

## remove|rm [options] [packages...]

```console
Usage: pkg-sync remove|rm [options] [packages...]

Remove package from sync

Arguments:
  packages           Package name (name set as "." will be set from closest package.json)

Options:
  -i, --interactive  Interactive mode (default: false)
  -a, --all          Remove all stored packages (default: false)
  -h, --help         display help for command

```

## list|ls

```console
Usage: pkg-sync list|ls [options]

Show all stored packages

Options:
  -h, --help  display help for command

```

## validate [options] [path]

```console
Usage: pkg-sync validate [options] [path]

Show coverage packages from project

Arguments:
  path                  Path to package (path not set will be set to closest package.json)

Options:
  -d, --depth [number]  Deep search of dependencies (default: 2, preset: 2)
  -h, --help            display help for command

```

## sync [options] [path] [packages...]

```console
Usage: pkg-sync sync [options] [path] [packages...]

Sync and watch packages in project

Arguments:
  path                  Path to package (path not set will be set to closest package.json)
  packages              Package name to sync

Options:
  --no-watch            Disable watch files after sync
  -i, --interactive     Interactive mode (default: false)
  -d, --depth [number]  Deep search of dependencies (default: 2, preset: 2)
  -h, --help            display help for command

```

## update-check

```console
Usage: pkg-sync update-check [options]

Check version of 'pkg-sync'

Options:
  -h, --help  display help for command

```

## config

```console
Usage: pkg-sync config [options] [command]

Config

Options:
  -h, --help         display help for command

Commands:
  set <key> <value>  Set config
  get [key]          Get config
  restore            Restore config to default
  help [command]     display help for command

```
