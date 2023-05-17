import { Argument, Command, Option } from 'commander';
import prompts from 'prompts';
import { getPackageJson } from '../utils/getPackageJson';
import { getApplicationData } from '../utils/getApplicationData';
import { ApplicationError } from '../models/ApplicationError';
import interactiveOption from './options/interactive';

interface RemoveCommandOptions {
    interactive: boolean;
    all: boolean;
}

export default new Command('remove')
    .alias('rm')
    .description('Remove package from sync')
    .addOption(interactiveOption)
    .addOption(new Option('-a, --all', 'Remove all stored packages').default(false))
    .addArgument(
        new Argument('[packages...]', 'Package name (name set as "." will be set from closest package.json)').argParser<
            string[]
        >((name, argument = []) => [...argument, name === '.' ? getPackageJson().name : name]),
    )
    .action(async (packages: string[], options: RemoveCommandOptions) => {
        const appData = getApplicationData();
        const appPackages = Object.keys(appData.packages);

        let selectedPackages = packages;
        if (options.all) {
            selectedPackages = appPackages;
        }

        if (options.interactive && appPackages.length) {
            selectedPackages = (
                await prompts({
                    type: 'multiselect',
                    name: 'packages',
                    message: 'Pick packages to remove',
                    choices: appPackages.map((value) => ({
                        value,
                        title: value,
                        selected: options.all || packages.includes(value),
                    })),
                })
            ).packages;
        }

        if (!selectedPackages?.length) {
            throw new ApplicationError('No packages provided');
        }

        for (const name of selectedPackages) {
            if (!appData.packages[name]) {
                console.log(`Package '${name}' does not exist in the list`);
            } else {
                console.log(`${name} was removed.`);
                delete appData.packages[name];
            }
        }
        appData.$save();
    });
