import { Command } from 'commander';
import { getPackageJson } from '../utils/getPackageJson';
import { getRelatedDependencies } from '../utils/getRelatedDependencies';
import { ApplicationError } from '../models/ApplicationError';
import depthOption from '../options/depth';

interface ValidateCommandOptions {
    depth: number;
}

export default new Command('validate')
    .description('Show coverage packages from project')
    .argument('[path]', 'Path to project (path not set will be set to closest package.json)')
    .addOption(depthOption)
    .action((path: string, options: ValidateCommandOptions) => {
        const packageJson = getPackageJson(path);
        const packages = getRelatedDependencies(packageJson, options.depth);
        if (!packages.length) {
            throw new ApplicationError('No related dependencies found');
        }
        console.log('Dependencies found', ...packages.map(({ name }) => name));
    });
