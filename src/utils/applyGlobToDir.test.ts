import { describe, expect, test } from "bun:test";
import { applyGlobToDir, applyGlobToDirs } from "./applyGlobToDir";

describe("applyGlobToDir", () => {
  test("appends a recursive glob to a directory name", () => {
    expect(applyGlobToDir("dist")).toBe("dist/**/*");
  });

  test("keeps each literal and adds a glob for every dir", () => {
    expect(applyGlobToDirs(["dist", "src"])).toEqual(["dist", "src", "dist/**/*", "src/**/*"]);
  });
});
