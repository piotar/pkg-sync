import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export interface JsonFileOptions<T> {
  defaultJson?: T;
  transform?(data: Partial<T>): T;
}

/**
 * A JSON file backed by a typed value. `load` returns a Proxy so callers can read/write the data's
 * fields directly (e.g. `file.config`), while the `$`-prefixed members expose the file itself.
 */
export class JsonFile<T> {
  public readonly $fileExists: boolean = false;
  public readonly $data?: T;

  private constructor(
    private $path: string = "",
    private $options?: JsonFileOptions<T>,
  ) {
    try {
      const data = JSON.parse(readFileSync(this.$path, "utf8")) as Partial<T>;
      this.$data = this.$options?.transform?.(data) ?? (data as T);
      this.$fileExists = true;
    } catch {
      this.$data = $options?.defaultJson;
    }
  }

  /** Load a file and wrap it so data fields are reachable directly on the returned handle. */
  static load<T extends Record<string | symbol, unknown> | undefined>(
    path: string,
    options?: JsonFileOptions<T>,
  ): JsonFile<T> & T {
    return new Proxy(new JsonFile<T>(path, options), {
      get(target, name: keyof JsonFile<T>) {
        return name in target ? target[name] : target.$data?.[name];
      },
      set(target, name, value) {
        if (target.$data) {
          target.$data[name] = value;
        }
        return true;
      },
    }) as JsonFile<T> & T;
  }

  /** Persist the current data to disk, creating the parent directory if needed. */
  public $save(): void {
    const baseName = this.$dirname;
    if (!existsSync(baseName)) {
      mkdirSync(baseName, { recursive: true });
    }
    writeFileSync(this.$path, JSON.stringify(this.$data));
  }

  public get $dirname(): string {
    return dirname(this.$path);
  }
}
