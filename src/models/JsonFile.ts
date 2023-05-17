import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export interface JsonFileOptions<T> {
    defaultJson?: T;
    transform?(data: Partial<T>): T;
}

export class JsonFile<T> {
    public readonly $fileExists: boolean = false;
    public readonly $data?: T;

    private constructor(private $path: string = '', private $options?: JsonFileOptions<T>) {
        try {
            const data = JSON.parse(readFileSync(this.$path, 'utf8'));
            this.$data = this.$options?.transform?.(data) ?? data;
            this.$fileExists = true;
        } catch (error) {
            this.$data = $options?.defaultJson;
        }
    }

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
                    return (target.$data[name] = value);
                }
            },
        }) as JsonFile<T> & T;
    }

    public $save() {
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
