import { Command } from 'commander';
import { getPackageJson } from '../utils/getPackageJson';
import { getRelatedDependencies } from '../utils/getRelatedDependencies';
import { ApplicationError } from '../models/ApplicationError';

export default new Command('validate')
    .description('Show coverage packages from project')
    .argument('[path]', 'Path to project (path not set will be set to closest package.json)')
    .action((path: string) => {
        const packageJson = getPackageJson(path);
        const packages = getRelatedDependencies(packageJson);
        if (!packages.length) {
            throw new ApplicationError('No related dependencies found');
        }
        console.log('Dependencies found', ...packages);
    });
