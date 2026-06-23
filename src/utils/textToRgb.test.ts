import { describe, expect, test } from "bun:test";
import { textToRgb } from "./textToRgb";

describe("textToRgb", () => {
  test("is stable for the same input", () => {
    expect(textToRgb("my-lib")).toEqual(textToRgb("my-lib"));
  });

  test("differs for different inputs", () => {
    expect(textToRgb("alpha")).not.toEqual(textToRgb("beta"));
  });

  test("returns three channels in the 0..255 range", () => {
    const color = textToRgb("anything");
    expect(color).toHaveLength(3);
    for (const channel of color) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(255);
    }
  });
});
