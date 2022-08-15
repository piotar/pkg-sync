#!/usr/bin/env node

import { Command } from 'commander';
import { PROJECT_NAME } from './common/appConfig';
import addCommand from './commands/add';
import removeCommand from './commands/remove';
import listCommand from './commands/list';
import validateCommand from './commands/validate';
import syncCommand from './commands/sync';
import updateCheckCommand from './commands/updateCheck';
import restoreCommand from './commands/restore';
import configCommand from './commands/config';
import { getPackageJson } from './utils/getPackageJson';
import { ApplicationError } from './models/ApplicationError';
import { checkUpdates } from './utils/checkUpdates';
import { getApplicationData } from './utils/getApplicationData';

const packageJson = getPackageJson(__dirname);

if (!packageJson.$fileExists) {
    throw new Error('Missing package.json');
}

const appData = getApplicationData();

const app = new Command()
    .name(PROJECT_NAME)
    .description(packageJson.description ?? '')
    .version(packageJson.version)
    .showHelpAfterError()
    .showSuggestionAfterError()
    .configureHelp({
        sortSubcommands: true,
    })
    .addCommand(addCommand)
    .addCommand(removeCommand)
    .addCommand(listCommand)
    .addCommand(validateCommand)
    .addCommand(syncCommand)
    .addCommand(updateCheckCommand)
    .addCommand(configCommand);

if (appData.config.restore) {
    app.addCommand(restoreCommand);
}

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
