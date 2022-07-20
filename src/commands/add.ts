import { Command } from 'commander';
import { getApplicationData } from '../utils/getApplicationData';
import { getPackageJson } from '../utils/getPackageJson';
import { ApplicationError } from '../models/ApplicationError';

interface AddCommandOptions {
    name?: string;
    force?: boolean;
    dir?: string[];
}

export default new Command('add')
    .description('Add package to sync')
    .argument('[path]', 'Path to package')
    .option('-n, --name <package>', 'Package name')
    .option('-f, --force', 'Override package')
    .option('-d, --dir [dirs...]', 'Directory to watch')
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
    });
