import { Argument, Command, Option } from 'commander';
import picomatch from 'picomatch';
import prompts from 'prompts';
import { getPackageJson } from '../utils/getPackageJson.js';
import { getRelatedDependencies } from '../utils/getRelatedDependencies.js';
import { getApplicationData } from '../utils/getApplicationData.js';
import { excludeRules, includeDirectoriesRules, matcherOptions } from '../common/watchRules.js';
import { SyncWatcher } from '../models/SyncWatcher.js';
import { ApplicationError } from '../models/ApplicationError.js';
import { applyGlobToDirs } from '../utils/applyGlobToDir.js';
import depthOption from './options/depth.js';
import interactiveOption from './options/interactive.js';
import pathArgument from './arguments/path.js';

interface SyncCommandOptions {
    watch: boolean;
    depth: number;
    interactive: boolean;
}

const appData = getApplicationData();

export default new Command('sync')
    .description('Sync and watch packages in project')
    .addArgument(pathArgument)
    .addArgument(
        new Argument('[packages...]', 'Package name to sync').argParser<string[]>((name, argument = []) => [
            ...argument,
            name,
        ]),
    )
    .addOption(new Option('--no-watch', 'Disable watch files after sync'))
    .addOption(interactiveOption)
    .addOption(depthOption)
    .action(async (path: string, packagesToSync: string[], options: SyncCommandOptions) => {
        const packageJson = getPackageJson(path);
        const relatedDependencies = getRelatedDependencies(packageJson, options.depth);

        let relatedPackages =
            packagesToSync?.length > 0
                ? relatedDependencies.filter((p) => packagesToSync.includes(p.name))
                : relatedDependencies;

        if (options.interactive && relatedDependencies.length) {
            relatedPackages = (
                await prompts({
                    type: 'multiselect',
                    name: 'packages',
                    message: 'Pick packages to sync',
                    choices: relatedDependencies.map((relatedPackage) => ({
                        value: relatedPackage,
                        title: relatedPackage.name,
                        selected: relatedPackages.some((p) => p === relatedPackage),
                    })),
                })
            ).packages;
        }

        if (!relatedPackages?.length) {
            throw new ApplicationError('No related dependencies found');
        }

        console.log('Dependencies to synchronization', ...relatedPackages.map(({ name }) => name));

        const excludeMatcher = picomatch(excludeRules, matcherOptions);
        const includeMatcher = picomatch(applyGlobToDirs(includeDirectoriesRules), matcherOptions);

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
