import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getDependencies } from "./getDependencies";
import { getPackageJson } from "./getPackageJson";

const tmpDirs: string[] = [];

/** Write a package.json with the given name and runtime deps. */
function writePackage(dir: string, name: string, dependencies: Record<string, string> = {}): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name, version: "1.0.0", dependencies }));
}

/**
 * Build a throwaway project where `root` depends on `a`, and `a` depends on `b`, both installed
 * under the root's node_modules.
 */
async function fixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "pkg-sync-deps-"));
  tmpDirs.push(root);
  writePackage(root, "root", { a: "1.0.0" });
  writePackage(join(root, "node_modules", "a"), "a", { b: "1.0.0" });
  writePackage(join(root, "node_modules", "b"), "b");
  return root;
}

afterAll(async () => {
  await Promise.all(tmpDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("getDependencies", () => {
  test("resolves the transitive tree within depth", async () => {
    const root = await fixture();
    const { packages } = getDependencies(getPackageJson(root), 2);
    const names = [...packages.keys()].map((pkg) => pkg.name).sort();
    expect(names).toEqual(["a", "b"]);
  });

  test("stops at depth 0 (direct deps only)", async () => {
    const root = await fixture();
    const { packages } = getDependencies(getPackageJson(root), 0);
    const names = [...packages.keys()].map((pkg) => pkg.name).sort();
    expect(names).toEqual(["a"]);
  });
});
