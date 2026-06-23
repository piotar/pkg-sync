import { describe, expect, test } from "bun:test";
import { partitionRemovals } from "./remove";

describe("partitionRemovals", () => {
  test("splits requested names into removed and missing", () => {
    expect(partitionRemovals(["a", "b"], ["a", "c"])).toEqual({ removed: ["a"], missing: ["c"] });
  });

  test("all missing when the registry is empty", () => {
    expect(partitionRemovals([], ["a"])).toEqual({ removed: [], missing: ["a"] });
  });
});
