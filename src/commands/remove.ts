import { Command } from 'commander';
import { getPackageJson } from '../utils/getPackageJson';
import { getApplicationData } from '../utils/getApplicationData';
import { ApplicationError } from '../models/ApplicationError';

export default new Command('remove')
    .description('Remove package from sync')
    .argument(
        '<package>',
        'Package name (name not set or set as "." will be set from closest package.json)',
        (name) => {
            if (name === '.') {
                return getPackageJson().name;
            }
            return name;
        },
    )
    .action((name: string) => {
        const appData = getApplicationData();
        if (!appData.packages[name]) {
            throw new ApplicationError(`Package '${name}' does not exist in the list`);
        }
        delete appData.packages[name];
        appData.$save();
        console.log(`${name} was removed.`);
    });
