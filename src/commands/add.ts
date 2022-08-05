import { Command } from 'commander';
import { getApplicationData } from '../utils/getApplicationData';
import { getPackageJson } from '../utils/getPackageJson';
import { ApplicationError } from '../models/ApplicationError';
import pathArgument from './arguments/path';

interface AddCommandOptions {
    name?: string;
    force?: boolean;
    dir?: string[];
}

export default new Command('add')
    .description('Add package to sync')
    .addArgument(pathArgument)
    .option('-n, --name <package>', 'Package name (override name from package.json)')
    .option('-f, --force', 'Override package')
    .option('-d, --dir [dirs...]', 'Directory to watch (override default values)')
    .action(async (path: string, options: AddCommandOptions) => {
        const packageJson = getPackageJson(path);
        const name = options.name ?? packageJson.name;

        const appData = getApplicationData();
        if (appData.packages[name] && !options.force) {
            throw new ApplicationError('Package already exists, use "--force" flag to override it');
        }

        appData.packages[name] = {
            path: packageJson.$dirname,
            dir: options.dir,
        };

        appData.$save();
        console.log(`${name} was added.`);
    });
