import { Command } from 'commander';
import { getPackageJson } from '../utils/getPackageJson.js';
import { getRelatedDependencies } from '../utils/getRelatedDependencies.js';
import { ApplicationError } from '../models/ApplicationError.js';
import depthOption from './options/depth.js';
import pathArgument from './arguments/path.js';

interface ValidateCommandOptions {
    depth: number;
}

export default new Command('validate')
    .description('Show coverage packages from project')
    .addArgument(pathArgument)
    .addOption(depthOption)
    .action((path: string, options: ValidateCommandOptions) => {
        const packageJson = getPackageJson(path);
        const packages = getRelatedDependencies(packageJson, options.depth);
        if (!packages.length) {
            throw new ApplicationError('No related dependencies found');
        }
        console.log('Dependencies found', ...packages.map(({ name }) => name));
    });
