#!/usr/bin/env node

import { Command } from 'commander';
import { PROJECT_NAME } from './common/appConfig';
import AddCommand from './commands/add';
import RemoveCommand from './commands/remove';
import ListCommand from './commands/list';
import ValidateCommand from './commands/validate';
import SyncCommand from './commands/sync';
import { getPackageJson } from './utils/getPackageJson';
import { ApplicationError } from './models/ApplicationError';
import { checkUpdates } from './utils/checkUpdates';

const packageJson = getPackageJson(__dirname);

if (!packageJson.$fileExists) {
    throw new Error('Missing package.json');
}

const app = new Command()
    .name(PROJECT_NAME)
    .description(packageJson.description ?? '')
    .version(packageJson.version)
    .showHelpAfterError()
    .showSuggestionAfterError()
    .addCommand(AddCommand)
    .addCommand(RemoveCommand)
    .addCommand(ListCommand)
    .addCommand(ValidateCommand)
    .addCommand(SyncCommand);

(async () => {
    try {
        await checkUpdates(packageJson);
        await app.parseAsync();
    } catch (error) {
        if (error instanceof ApplicationError) {
            console.log(error.message);
        } else {
            throw error;
        }
    }
})();
