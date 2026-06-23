import type { PicomatchOptions } from "picomatch";

/** Case-insensitive matching that also considers dotfiles. */
export const matcherOptions: PicomatchOptions = {
  nocase: true,
  dot: true,
};

/** Files and folders never worth syncing (VCS metadata, lockfiles, editor cruft). */
export const excludeRules = [
  ".npmignore",
  ".gitignore",
  "/package.json",
  "**/.git",
  "**/.svn",
  "**/.hg",
  "**/CVS",
  "**/.git/**",
  "**/.svn/**",
  "**/.hg/**",
  "**/CVS/**",
  "/.lock-wscript",
  "/.wafpickle-*",
  "/build/config.gypi",
  "npm-debug.log",
  "**/.npmrc",
  ".*.swp",
  ".DS_Store",
  "**/.DS_Store/**",
  "._*",
  "**/._*/**",
  "*.orig",
  "/package-lock.json",
  "/yarn.lock",
  "/pnpm-lock.yaml",
  "/archived-packages/**",
  "**/*~",
];

/** Directories synced by default when a package declares no custom `dir`. */
export const includeDirectoriesRules = ["dist", "lib", "build", "src"];
