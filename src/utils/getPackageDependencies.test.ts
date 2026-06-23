import { describe, expect, test } from "bun:test";
import { getPackageDependencies } from "./getPackageDependencies";
import type { PackageJson } from "./getPackageJson";

/** Build a minimal PackageJson for tests. */
function pkg(partial: Partial<PackageJson>): PackageJson {
  return { name: "x", version: "1.0.0", $dependencies: new Set<string>(), ...partial };
}

describe("getPackageDependencies", () => {
  test("merges runtime, dev and peer deps without duplicates", () => {
    const result = getPackageDependencies(
      pkg({
        dependencies: { a: "1", shared: "1" },
        devDependencies: { b: "1" },
        peerDependencies: { shared: "1", c: "1" },
      }),
    );
    expect([...result].sort()).toEqual(["a", "b", "c", "shared"]);
  });

  test("ignores optional deps and tolerates missing fields", () => {
    expect(getPackageDependencies(pkg({ optionalDependencies: { z: "1" } })).size).toBe(0);
  });
});
