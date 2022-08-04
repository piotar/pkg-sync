import { Command } from 'commander';
import picomatch from 'picomatch';
import prompts from 'prompts';
import { getPackageJson } from '../utils/getPackageJson';
import { getRelatedDependencies } from '../utils/getRelatedDependencies';
import { getApplicationData } from '../utils/getApplicationData';
import { excludeRules, includeDirectoriesRules } from '../common/watchRules';
import { SyncWatcher } from '../models/SyncWatcher';
import { ApplicationError } from '../models/ApplicationError';
import { applyGlobToDirs } from '../utils/applyGlobToDir';
import depthOption from '../options/depth';
import interactiveOption from '../options/interactive';

interface SyncCommandOptions {
    watch: boolean;
    depth: number;
    interactive: boolean;
}

export default new Command('sync')
    .description('Sync and watch packages in project')
    .argument('[path]', 'Path to project (path not set will be set to closest package.json)')
    .option('--no-watch', 'Disable watch files after sync')
    .addOption(interactiveOption)
    .addOption(depthOption)
    .action(async (path: string, options: SyncCommandOptions) => {
        const packageJson = getPackageJson(path);
        let relatedPackages = getRelatedDependencies(packageJson, options.depth);

        if (options.interactive && relatedPackages.length) {
            relatedPackages = (
                await prompts({
                    instructions: false,
                    type: 'multiselect',
                    name: 'packages',
                    message: 'Pick packages to sync',
                    choices: relatedPackages.map((relatedPackage) => ({
                        value: relatedPackage,
                        title: relatedPackage.name,
                        selected: true,
                    })),
                })
            ).packages;
        }

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
