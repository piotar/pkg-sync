import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import picomatch from "picomatch";
import { SyncWatcher } from "./SyncWatcher";
import { excludeRules, matcherOptions } from "../common/watchRules";

const tmpDirs: string[] = [];

/** Create an empty source/target pair under a throwaway directory. */
async function dirs(): Promise<{ source: string; target: string }> {
  const root = await mkdtemp(join(tmpdir(), "pkg-sync-watch-"));
  tmpDirs.push(root);
  const source = join(root, "source");
  const target = join(root, "target");
  mkdirSync(source, { recursive: true });
  mkdirSync(target, { recursive: true });
  return { source, target };
}

/** Run the watcher's private debounced flush synchronously, bypassing the timer. */
function flush(watcher: SyncWatcher): void {
  (watcher as unknown as { sync(): void }).sync();
}

afterAll(async () => {
  await Promise.all(tmpDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("SyncWatcher", () => {
  test("copy mirrors included entries and skips others", async () => {
    const { source, target } = await dirs();
    mkdirSync(join(source, "src"));
    writeFileSync(join(source, "src", "index.js"), "ok");
    writeFileSync(join(source, "package.json"), "{}");

    const watcher = new SyncWatcher(source, target, {
      name: "pkg",
      include: picomatch(["src", "src/**/*"], matcherOptions),
      exclude: picomatch(excludeRules, matcherOptions),
    });
    watcher.copy();
    // copy() arms the 600ms debounce; wait for the real flush so no timer dangles.
    await new Promise((resolve) => setTimeout(resolve, 700));

    expect(existsSync(join(target, "src", "index.js"))).toBe(true);
    expect(existsSync(join(target, "package.json"))).toBe(false);
  });

  test("add keeps only paths passing include/exclude", async () => {
    const { source, target } = await dirs();
    const watcher = new SyncWatcher(source, target, {
      name: "pkg",
      include: picomatch("**", matcherOptions),
      exclude: picomatch(excludeRules, matcherOptions),
    });
    watcher.add("src/index.js");
    watcher.add(".DS_Store");
    watcher.add("src/.git/config");

    expect([...watcher]).toEqual(["src/index.js"]);
  });

  test("sync removes a target file that no longer exists in source", async () => {
    const { source, target } = await dirs();
    writeFileSync(join(target, "stale.js"), "old");

    const watcher = new SyncWatcher(source, target, {
      name: "pkg",
      include: picomatch("**", matcherOptions),
      exclude: picomatch(excludeRules, matcherOptions),
    });
    watcher.add("stale.js");
    flush(watcher);

    expect(existsSync(join(target, "stale.js"))).toBe(false);
  });

  test("refuses to sync a directory onto itself", async () => {
    const { source } = await dirs();
    writeFileSync(join(source, "marker.js"), "x");

    const watcher = new SyncWatcher(source, source);
    expect(watcher.canProcess).toBe(false);
    // copy() is replaced with a no-op notice, so nothing changes on disk.
    watcher.copy();
    expect([...watcher]).toEqual([]);
  });
});
