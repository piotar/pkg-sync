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

Add package to sync

```
Arguments:
  path                  Path to package (path not set will be set to closest package.json)

Options:
  -n, --name <package>  Package name (override name from package.json)
  -f, --force           Override package
  -d, --dir [dirs...]   Directory to watch (override default values)
```

## remove &lt;package&gt;

Remove package from sync

```
Arguments:
  package     Package name (name set as "." will be set from closest package.json)
```

## list|ls

Show all stored packages


## validate [path]

Show coverage packages from project

```
Arguments:
  path        Path to project (path not set will be set to closest package.json)
```


## sync [options] [path]

Sync and watch packages in project

```
Arguments:
  path        Path to project (path not set will be set to closest package.json)

Options:
  --no-watch  Disable watch files after sync
```