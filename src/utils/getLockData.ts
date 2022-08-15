import { resolve } from 'node:path';
import { JsonFile } from '../models/JsonFile';
import { PROJECT_DIR, PROJECT_LOCK_FILE, SESSION_ID } from '../common/appConfig';
import { LockEntry } from '../models/LockEntry';

export interface LockData {
    version: number;
    entries: LockEntry[];
}

export interface LockActions {
    $archive(packages: string[]): void;
    $restore(id?: string, shouldDelete?: boolean): void;
    $remove(ids: string[]): void;
}

const defaultJson: LockData = {
    version: 1,
    entries: [],
};

function transform(data: Partial<LockData>): LockData {
    return {
        ...defaultJson,
        ...data,
        entries: data.entries?.map(({ id, packages, date }) => new LockEntry(id, packages, date)) ?? [],
    };
}

export interface LockDataFile extends JsonFile<LockData>, LockData, LockActions {}

function extendLockData(lockData: JsonFile<LockData> & LockData, path: string): LockActions {
    return {
        $archive(packages: string[]) {
            const lockEntry = new LockEntry(SESSION_ID, packages);
            lockEntry.archive(path);
            lockData.entries.push(lockEntry);
            lockData.$save();
        },
        $restore(id: string = SESSION_ID, shouldDelete: boolean = true) {
            const lockEntry = lockData.entries.find((entry) => entry.id === id);
            if (lockEntry) {
                lockEntry.restore(path);
                if (shouldDelete) {
                    this.$remove([lockEntry.id]);
                }
            }
        },
        $remove(ids: string[]) {
            lockData.entries
                .filter((entry) => ids.includes(entry.id))
                .forEach((lockEntry) => {
                    lockEntry.removeArchives(path);
                });
            lockData.entries = lockData.entries.filter((entry) => ids.includes(entry.id));
            lockData.$save();
        },
    };
}

const cache: Map<string, LockDataFile> = new Map();

export function getLockData(path: string): LockDataFile {
    let json = cache.get(path);
    if (!json) {
        const lockPath = resolve(path, 'node_modules', PROJECT_DIR, PROJECT_LOCK_FILE);
        const lockData = JsonFile.load<LockData>(lockPath, { defaultJson, transform });
        const lockActions = extendLockData(lockData, path);
        json = new Proxy(lockData, {
            get(target, name) {
                return name in lockActions ? lockActions[name] : target[name];
            },
        }) as LockDataFile;
    }
    return json;
}
