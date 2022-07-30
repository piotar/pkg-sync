import { Command } from 'commander';
import picomatch from 'picomatch';
import { getPackageJson } from '../utils/getPackageJson';
import { getRelatedDependencies } from '../utils/getRelatedDependencies';
import { getApplicationData } from '../utils/getApplicationData';
import { excludeRules, includeDirectoriesRules } from '../common/watchRules';
import { SyncWatcher } from '../models/SyncWatcher';
import { ApplicationError } from '../models/ApplicationError';
import { applyGlobToDirs } from '../utils/applyGlobToDir';
import depthOption from '../options/depth';

interface SyncCommandOptions {
    watch: boolean;
    depth: number;
}

export default new Command('sync')
    .description('Sync and watch packages in project')
    .argument('[path]', 'Path to project (path not set will be set to closest package.json)')
    .option('--no-watch', 'Disable watch files after sync')
    .addOption(depthOption)
    .action((path: string, options: SyncCommandOptions) => {
        const packageJson = getPackageJson(path);
        const relatedPackages = getRelatedDependencies(packageJson, options.depth);
        if (!relatedPackages.length) {
            throw new ApplicationError('No related dependencies found');
        }

        console.log('Dependencies found', ...relatedPackages.map(({ name }) => name));

        const matcherOptions: picomatch.PicomatchOptions = {
            nocase: true,
            dot: true,
        };
        const excludeMatcher = picomatch(excludeRules, matcherOptions);
        const includeMatcher = picomatch(applyGlobToDirs(includeDirectoriesRules), matcherOptions);

        const appData = getApplicationData();
        const packages = relatedPackages.map((dependencyPackage) => {
            const packageRecord = appData.packages[dependencyPackage.name];

            return new SyncWatcher(packageRecord.path, dependencyPackage.$dirname, {
                name: dependencyPackage.name,
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
