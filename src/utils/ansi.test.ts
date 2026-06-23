import { afterEach, describe, expect, test } from "bun:test";
import { green, rgb, yellow } from "./ansi";

const stdout = process.stdout as unknown as { isTTY?: boolean };
const originalTTY = stdout.isTTY;
const originalNoColor = process.env.NO_COLOR;

/** Force the "color enabled" branch (TTY + no NO_COLOR). */
function enableColor(): void {
  delete process.env.NO_COLOR;
  stdout.isTTY = true;
}

afterEach(() => {
  stdout.isTTY = originalTTY;
  if (originalNoColor === undefined) delete process.env.NO_COLOR;
  else process.env.NO_COLOR = originalNoColor;
});

describe("ansi", () => {
  test("emits SGR codes when color is enabled", () => {
    enableColor();
    expect(green("x")).toBe("\x1b[32mx\x1b[39m");
    expect(yellow("x")).toBe("\x1b[93mx\x1b[39m");
    expect(rgb([1, 2, 3], "x")).toBe("\x1b[38;2;1;2;3mx\x1b[39m");
  });

  test("returns plain text when NO_COLOR is set", () => {
    enableColor();
    process.env.NO_COLOR = "1";
    expect(green("x")).toBe("x");
    expect(rgb([1, 2, 3], "x")).toBe("x");
  });

  test("returns plain text on a non-TTY stdout", () => {
    delete process.env.NO_COLOR;
    stdout.isTTY = false;
    expect(yellow("x")).toBe("x");
  });
});
