import { resolve } from 'node:path';
import { Command } from 'commander';
import picomatch from 'picomatch';
import { getPackageJson } from '../utils/getPackageJson';
import { getRelatedDependencies } from '../utils/getRelatedDependencies';
import { getApplicationData } from '../utils/getApplicationData';
import { excludeRules, includeDirectoriesRules } from '../common/watchRules';
import { SyncWatcher } from '../models/SyncWatcher';
import { ApplicationError } from '../models/ApplicationError';
import { applyGlobToDirs } from '../utils/applyGlobToDir';

interface SyncCommandOptions {
    watch?: boolean;
}

export default new Command('sync')
    .description('Sync and watch packages in project')
    .argument('[path]', 'Path to project (path not set will be set to closest package.json)')
    .option('--no-watch', 'Disable watch files after sync')
    .action((path: string, options: SyncCommandOptions) => {
        const packageJson = getPackageJson(path);
        const relatedPackages = getRelatedDependencies(packageJson);
        if (!relatedPackages.length) {
            throw new ApplicationError('No related dependencies found');
        }

        console.log('Dependencies found', ...relatedPackages);

        const matcherOptions: picomatch.PicomatchOptions = {
            nocase: true,
            dot: true,
        };
        const excludeMatcher = picomatch(excludeRules, matcherOptions);
        const includeMatcher = picomatch(applyGlobToDirs(includeDirectoriesRules), matcherOptions);

        const appData = getApplicationData();
        const packages = relatedPackages.map((packageName) => {
            const packageRecord = appData.packages[packageName];
            const target = resolve(packageJson.$dirname, 'node_modules', packageName);

            return new SyncWatcher(packageRecord.path, target, {
                name: packageName,
                include: packageRecord.dir?.length
                    ? picomatch(applyGlobToDirs(packageRecord.dir), matcherOptions)
                    : includeMatcher,
                exclude: excludeMatcher,
            });
        });

        packages.forEach((p) => p.copy());
        if (options.watch) {
            packages.forEach((p) => p.watch());
        }
    });
