# pkg-sync

[![GitHub package.json version](https://img.shields.io/github/package-json/v/piotar/pkg-sync)](https://github.com/piotar/pkg-sync)
[![npm (scoped)](https://img.shields.io/npm/v/@piotar/pkg-sync)](https://www.npmjs.com/package/@piotar/pkg-sync)
![node-current (scoped)](https://img.shields.io/node/v/@piotar/pkg-sync)
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

## add

```console
Add package to sync (pkg-sync add v2.0.2)

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
Remove package from sync (pkg-sync remove v2.0.2)

USAGE pkg-sync remove [OPTIONS] [PACKAGES]

ARGUMENTS

  PACKAGES    Package name (use "." for the closest package.json)

OPTIONS

  -i, --interactive    Interactive mode (Default: false)          
          -a, --all    Remove all stored packages (Default: false)

```

## list

```console
Show all stored packages (pkg-sync list v2.0.2)

USAGE pkg-sync list 

```

## validate

```console
Show coverage packages from project (pkg-sync validate v2.0.2)

USAGE pkg-sync validate [OPTIONS] [PATH]

ARGUMENTS

  PATH    Path to package (path not set will be set to closest package.json)

OPTIONS

  -d, --depth=<depth>    Deep search of dependencies (Default: 2)

```

## sync

```console
Sync and watch packages in project (pkg-sync sync v2.0.2)

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
Check version of 'pkg-sync' (pkg-sync update-check v2.0.2)

USAGE pkg-sync update-check 

```

## config

```console
Config (pkg-sync config v2.0.2)

USAGE pkg-sync config set|get|restore

COMMANDS

      set    Set config               
      get    Get config               
  restore    Restore config to default

Use pkg-sync config <command> --help for more information about a command.
```
