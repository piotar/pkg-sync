import { cpSync, rmSync, watch, existsSync, realpathSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import picomatch from 'picomatch';
import chalk from 'chalk';
import { RgbColor, textToRgb } from '../utils/textToRgb';

interface SyncWatcherOptions {
    name: string;
    include: picomatch.Matcher;
    exclude: picomatch.Matcher;
}

export class SyncWatcher extends Set<string> {
    private handler?: ReturnType<typeof setTimeout>;
    private readonly color: RgbColor;

    constructor(
        private readonly source: string,
        private readonly target: string,
        private readonly options?: SyncWatcherOptions,
    ) {
        super();
        this.color = textToRgb(this.options?.name);

        if (realpathSync(source) === realpathSync(target)) {
            return Object.assign(this, {
                watch: () => this.log('[WATCH]', 'Source and destination path are equal'),
                copy: () => this.log('[COPY]', 'Source and destination path are equal'),
            });
        }
    }

    public add(path: string): this {
        if (this.isValid(path)) {
            super.add(path);
        }
        return this;
    }

    public clear(): void {
        super.clear();
        this.handler = undefined;
    }

    public watch(): void {
        watch(this.source, { recursive: true }, (event, filename) => {
            this.add(filename);
            this.tick();
        });
    }

    public copy(): void {
        const files = readdirSync(this.source);
        files.forEach((filename) => {
            this.add(filename);
        });
        this.tick();
    }

    private log(...message: unknown[]): void {
        console.log(chalk.rgb(...this.color)`${this.options?.name}`, ...message);
    }

    private tick(): void {
        clearTimeout(this.handler);
        this.handler = setTimeout(this.sync.bind(this), 600);
    }

    private sync(): void {
        this.forEach((item) => {
            const a = resolve(this.source, item);
            const b = resolve(this.target, item);

            if (existsSync(a)) {
                cpSync(a, b, { force: true, recursive: true });
            } else {
                rmSync(b, { force: true });
            }
            this.log('[SYNC]', a, '->', b);
        });
        this.clear();
    }

    private isValid(filename: string): boolean {
        return this.options ? this.options?.include(filename) && !this.options?.exclude(filename) : true;
    }
}
