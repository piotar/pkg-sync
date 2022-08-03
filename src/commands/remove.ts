import { Command } from 'commander';
import { getPackageJson } from '../utils/getPackageJson';
import { getApplicationData } from '../utils/getApplicationData';

export default new Command('remove')
    .alias('rm')
    .description('Remove package from sync')
    .argument(
        '<packages...>',
        'Package name (name set as "." will be set from closest package.json)',
        (packages: string[]) => {
            return packages.map((name) => (name === '.' ? getPackageJson().name : name));
        },
    )
    .action((packages: string[]) => {
        const appData = getApplicationData();
        for (const name of packages) {
            if (!appData.packages[name]) {
                console.log(`Package '${name}' does not exist in the list`);
            } else {
                console.log(`${name} was removed.`);
                delete appData.packages[name];
            }
        }
        appData.$save();
    });
