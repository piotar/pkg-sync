import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export class JsonFile<T> {
    public readonly $fileExists: boolean = false;
    private readonly $data?: T;

    private constructor(private path: string = '', defaultJson?: T) {
        try {
            this.$data = JSON.parse(readFileSync(this.path, 'utf8'));
            this.$fileExists = true;
        } catch (error) {
            this.$data = defaultJson;
        }
    }

    static load<T>(path: string, defaultJson?: T): JsonFile<T> & T {
        return new Proxy(new JsonFile<T>(path, defaultJson), {
            get(target, name) {
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
        writeFileSync(this.path, JSON.stringify(this.$data));
    }

    public get $dirname(): string {
        return dirname(this.path);
    }
}
