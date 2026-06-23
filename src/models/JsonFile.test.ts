import { afterAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JsonFile } from "./JsonFile";

const tmpDirs: string[] = [];

/** Create a throwaway directory tracked for cleanup. */
async function tmp(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pkg-sync-"));
  tmpDirs.push(dir);
  return dir;
}

afterAll(async () => {
  await Promise.all(tmpDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

interface Data extends Record<string | symbol, unknown> {
  count: number;
}

describe("JsonFile", () => {
  test("falls back to defaultJson when the file is missing", async () => {
    const dir = await tmp();
    const file = JsonFile.load<Data>(join(dir, "missing", "data.json"), { defaultJson: { count: 1 } });
    expect(file.$fileExists).toBe(false);
    expect(file.count).toBe(1);
  });

  test("persists changes and reloads them, creating parent dirs", async () => {
    const dir = await tmp();
    const path = join(dir, "nested", "data.json");
    const file = JsonFile.load<Data>(path, { defaultJson: { count: 0 } });
    file.count = 5;
    file.$save();
    expect(existsSync(path)).toBe(true);

    const reloaded = JsonFile.load<Data>(path, { defaultJson: { count: 0 } });
    expect(reloaded.$fileExists).toBe(true);
    expect(reloaded.count).toBe(5);
  });

  test("applies transform on load", async () => {
    const dir = await tmp();
    const path = join(dir, "data.json");
    JsonFile.load<Data>(path, { defaultJson: { count: 1 } }).$save();

    const transformed = JsonFile.load<Data & { extra: boolean }>(path, {
      transform: (data) => ({ count: data.count ?? 0, extra: true }),
    });
    expect(transformed.extra).toBe(true);
    expect(transformed.count).toBe(1);
  });
});
