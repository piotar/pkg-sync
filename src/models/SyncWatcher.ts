import { cpSync, rmSync, existsSync, watch, realpathSync, readdirSync, type FSWatcher } from "node:fs";
import { resolve } from "node:path";
import picomatch from "picomatch";
import { type RgbColor, textToRgb } from "../utils/textToRgb";
import { rgb } from "../utils/ansi";
import { isJsonMode, note } from "../utils/output";

/** Debounce window: batch rapid file events into a single sync pass. */
const SYNC_DEBOUNCE_MS = 600;

interface SyncWatcherOptions {
  name: string;
  include: picomatch.Matcher;
  exclude: picomatch.Matcher;
}

/**
 * Mirrors one package's source directory into a target, on demand (`copy`) or live (`watch`).
 * Pending file paths are collected in the underlying Set and flushed together after a short debounce.
 */
export class SyncWatcher extends Set<string> {
  private handler?: ReturnType<typeof setTimeout>;
  private readonly color: RgbColor;
  public readonly canProcess: boolean;

  constructor(
    public readonly source: string,
    public readonly target: string,
    private readonly options?: SyncWatcherOptions,
  ) {
    super();
    this.color = textToRgb(this.options?.name);

    // Refuse to sync a directory onto itself; replace the public methods with a no-op + notice.
    this.canProcess = realpathSync(source) !== realpathSync(target);
    if (!this.canProcess) {
      Object.assign(this, {
        watch: () => this.log("[WATCH]", "Source and destination path are equal"),
        copy: () => this.log("[COPY]", "Source and destination path are equal"),
      });
    }
  }

  /** Queue a path for syncing, keeping only those that pass the include/exclude rules. */
  public override add(path: string): this {
    if (this.isValid(path)) {
      super.add(path);
    }
    return this;
  }

  public override clear(): void {
    super.clear();
    this.handler = undefined;
  }

  /** Watch the source recursively and sync every change. */
  public watch(): FSWatcher {
    return watch(this.source, { recursive: true }, (_event, filename) => {
      if (filename) {
        this.add(filename);
        this.tick();
      }
    });
  }

  /** Do a one-shot full sync of the source's top-level entries. */
  public copy(): void {
    for (const filename of readdirSync(this.source)) {
      this.add(filename);
    }
    this.tick();
  }

  /** Log a message prefixed with the package name in its stable color. Progress goes to stderr in
   * JSON mode so it never pollutes the data on stdout. */
  private log(...message: unknown[]): void {
    const line = [rgb(this.color, this.options?.name ?? ""), ...message];
    if (isJsonMode()) note(...line);
    else console.log(...line);
  }

  /** (Re)arm the debounce timer so a burst of events flushes once. */
  private tick(): void {
    clearTimeout(this.handler);
    this.handler = setTimeout(this.sync.bind(this), SYNC_DEBOUNCE_MS);
  }

  /** Flush all queued paths: copy existing files, remove deleted ones, then reset the queue. */
  private sync(): void {
    this.forEach((item) => {
      const from = resolve(this.source, item);
      const to = resolve(this.target, item);

      if (existsSync(from)) {
        cpSync(from, to, { force: true, recursive: true });
      } else {
        rmSync(to, { force: true, recursive: true });
      }
      this.log("[SYNC]", from, "->", to);
    });
    this.clear();
  }

  /** A path is valid when it matches the include rules and not the exclude rules. */
  private isValid(filename: string): boolean {
    return this.options ? this.options.include(filename) && !this.options.exclude(filename) : true;
  }
}
