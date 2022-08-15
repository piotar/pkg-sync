import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import picomatch from 'picomatch';
import { create, extract } from 'tar';
import { PROJECT_ARCHIVE_DIR, PROJECT_DIR } from '../common/appConfig';
import { excludeRules, matcherOptions } from '../common/watchRules';
import { generateId } from '../utils/generateId';

export class LockEntry {
    constructor(
        public id: string = generateId(),
        public packages: string[] = [],
        public date: ReturnType<typeof Date.now> = Date.now(),
    ) {}

    private getArchivePath(path: string, index?: number): string {
        const pathChain = [path, 'node_modules', PROJECT_DIR, PROJECT_ARCHIVE_DIR];
        if (typeof index === 'number') {
            pathChain.push(`${this.id}_${index}.tgz`);
        }
        return resolve(...pathChain);
    }

    public archive(path: string): string[] {
        const archivePath = this.getArchivePath(path);
        if (!existsSync(archivePath)) {
            mkdirSync(archivePath, { recursive: true });
        }
        const excludeMatcher = picomatch(excludeRules, matcherOptions);

        return this.packages.map((packagePath, i) => {
            const files = readdirSync(packagePath, 'utf8').filter((file) => !excludeMatcher(file));
            create(
                {
                    file: this.getArchivePath(path, i),
                    gzip: true,
                    sync: true,
                    cwd: packagePath,
                },
                files,
            );
            return packagePath;
        });
    }

    public restore(path: string): string[] {
        return this.packages.map((packagePath, i) => {
            extract({
                cwd: packagePath,
                file: this.getArchivePath(path, i),
                sync: true,
            });
            return packagePath;
        });
    }

    public removeArchives(path: string): void {
        this.packages.forEach((_, i) => {
            rmSync(this.getArchivePath(path, i), { force: true });
        });
    }
}
