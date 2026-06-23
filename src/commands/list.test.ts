import { describe, expect, test } from "bun:test";
import { listResult } from "./list";
import type { ApplicationData } from "../utils/getApplicationData";

/** Build a minimal ApplicationData around a set of registered packages. */
function appData(packages: ApplicationData["packages"]): ApplicationData {
  return { version: 1, updateCheck: 0, packages, config: { depth: 2 }, targets: {} };
}

describe("listResult", () => {
  test("maps registered packages to name/path/dir", () => {
    const result = listResult(appData({ "my-lib": { path: "/src/my-lib", dir: ["dist"] } }));
    expect(result.packages).toEqual([{ name: "my-lib", path: "/src/my-lib", dir: ["dist"] }]);
    expect(result.defaultWatchDirs).toContain("dist");
    expect(typeof result.dataFile).toBe("string");
  });

  test("empty registry yields no packages", () => {
    expect(listResult(appData({})).packages).toEqual([]);
  });
});
