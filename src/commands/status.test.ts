import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { statusResult } from "./status";
import type { ApplicationData } from "../utils/getApplicationData";

const tmpDirs: string[] = [];

/** Build a minimal ApplicationData around a set of active syncs. */
function appData(targets: ApplicationData["targets"]): ApplicationData {
  return { version: 1, updateCheck: 0, packages: {}, config: { depth: 2 }, targets };
}

afterAll(async () => {
  await Promise.all(tmpDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("statusResult", () => {
  test("flags a target as stale when node_modules is missing", () => {
    const result = statusResult(appData({ "/gone": { packages: ["a"], syncedAt: 0 } }));
    expect(result).toEqual([{ path: "/gone", packages: ["a"], syncedAt: 0, stale: true }]);
  });

  test("a live target with node_modules is not stale", async () => {
    const root = await mkdtemp(join(tmpdir(), "pkg-sync-status-"));
    tmpDirs.push(root);
    mkdirSync(join(root, "node_modules"), { recursive: true });
    const [entry] = statusResult(appData({ [root]: { packages: ["a", "b"], syncedAt: 5 } }));
    expect(entry).toEqual({ path: root, packages: ["a", "b"], syncedAt: 5, stale: false });
  });

  test("narrows to a single target when one is given", () => {
    const data = appData({
      "/one": { packages: ["a"], syncedAt: 0 },
      "/two": { packages: ["b"], syncedAt: 0 },
    });
    const result = statusResult(data, "/two");
    expect(result.map((entry) => entry.path)).toEqual(["/two"]);
  });

  test("returns an empty list when nothing is synced", () => {
    expect(statusResult(appData({}))).toEqual([]);
  });

  test("reports several targets, flagging the stale one", async () => {
    const live = await mkdtemp(join(tmpdir(), "pkg-sync-status-"));
    tmpDirs.push(live);
    mkdirSync(join(live, "node_modules"), { recursive: true });
    const result = statusResult(
      appData({
        [live]: { packages: ["a"], syncedAt: 1 },
        "/gone": { packages: ["b"], syncedAt: 2 },
      }),
    );
    expect(result).toEqual([
      { path: live, packages: ["a"], syncedAt: 1, stale: false },
      { path: "/gone", packages: ["b"], syncedAt: 2, stale: true },
    ]);
  });
});
