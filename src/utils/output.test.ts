import { afterEach, describe, expect, test } from "bun:test";
import { emitJson, isJsonMode, setJsonMode } from "./output";

afterEach(() => setJsonMode(false));

describe("output", () => {
  test("json mode toggles", () => {
    expect(isJsonMode()).toBe(false);
    setJsonMode(true);
    expect(isJsonMode()).toBe(true);
  });

  test("emitJson writes a single JSON line to stdout", () => {
    const original = process.stdout.write.bind(process.stdout);
    let captured = "";
    (process.stdout as unknown as { write: (s: string) => boolean }).write = (s: string) => {
      captured += s;
      return true;
    };
    try {
      emitJson({ a: 1, b: ["x"] });
    } finally {
      (process.stdout as unknown as { write: typeof original }).write = original;
    }
    expect(captured).toBe('{"a":1,"b":["x"]}\n');
  });
});
