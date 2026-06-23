import { afterAll, describe, expect, test } from "bun:test";
import { writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectPackageManager, nextSession } from "./unsync";

const tmpDirs: string[] = [];

/** Make a temp dir holding the given lockfiles, and return its path. */
async function withLockfiles(...lockfiles: string[]): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "pkg-sync-unsync-"));
  tmpDirs.push(root);
  for (const name of lockfiles) writeFileSync(join(root, name), "");
  return root;
}

afterAll(async () => {
  await Promise.all(tmpDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("detectPackageManager", () => {
  test("recognizes bun from bun.lock", async () => {
    expect(detectPackageManager(await withLockfiles("bun.lock"))).toBe("bun");
  });

  test("recognizes bun from bun.lockb", async () => {
    expect(detectPackageManager(await withLockfiles("bun.lockb"))).toBe("bun");
  });

  test("recognizes pnpm from pnpm-lock.yaml", async () => {
    expect(detectPackageManager(await withLockfiles("pnpm-lock.yaml"))).toBe("pnpm");
  });

  test("recognizes yarn from yarn.lock", async () => {
    expect(detectPackageManager(await withLockfiles("yarn.lock"))).toBe("yarn");
  });

  test("defaults to npm when no lockfile is present", async () => {
    expect(detectPackageManager(await withLockfiles())).toBe("npm");
  });

  test("prefers bun > pnpm > yarn when several lockfiles coexist", async () => {
    expect(detectPackageManager(await withLockfiles("bun.lock", "pnpm-lock.yaml", "yarn.lock"))).toBe("bun");
    expect(detectPackageManager(await withLockfiles("pnpm-lock.yaml", "yarn.lock"))).toBe("pnpm");
  });
});

describe("nextSession", () => {
  test("keeps the remaining packages when a subset is unsynced", () => {
    const session = { packages: ["a", "b", "c"], syncedAt: 7 };
    expect(nextSession(session, ["b"])).toEqual({ packages: ["a", "c"], syncedAt: 7 });
  });

  test("returns null when every package is unsynced", () => {
    expect(nextSession({ packages: ["a", "b"], syncedAt: 0 }, ["a", "b"])).toBeNull();
  });

  test("preserves other session fields", () => {
    const next = nextSession({ packages: ["a", "b"], syncedAt: 42 }, ["a"]);
    expect(next).toEqual({ packages: ["b"], syncedAt: 42 });
  });
});
