#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Command, Help } from 'commander';
import { PROJECT_NAME } from './common/appConfig.js';
import addCommand from './commands/add.js';
import removeCommand from './commands/remove.js';
import listCommand from './commands/list.js';
import validateCommand from './commands/validate.js';
import syncCommand from './commands/sync.js';
import updateCheckCommand from './commands/updateCheck.js';
import configCommand from './commands/config.js';
import { getPackageJson } from './utils/getPackageJson.js';
import { ApplicationError } from './models/ApplicationError.js';
import { checkUpdates } from './utils/checkUpdates.js';

const packageJson = getPackageJson(import.meta.dirname);

if (!packageJson.$fileExists) {
    throw new Error('Missing package.json');
}

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

app.command('doc', { hidden: true }).action(() => {
    const file = resolve(process.cwd(), './README.md');

    if (existsSync(file)) {
        const readme = readFileSync(file, 'utf8').split('\n');

        const helpHelper = Object.assign(new Help(), { helpWidth: 1000 });
        const help = app.commands
            .filter((command) => command.name() !== 'doc')
            .map((command) =>
                [
                    `## ${helpHelper.subcommandTerm(command)}\n`,
                    '```console',
                    helpHelper.formatHelp(command, helpHelper),
                    '```\n',
                ].join('\n'),
            )
            .join('\n');

        const commandsHeader = readme.findIndex((line) => line.startsWith('# Commands'));

        if (commandsHeader < 0) {
            throw new ApplicationError('Missing Commands header in README.md');
        }
        writeFileSync(file, [...readme.slice(0, commandsHeader + 2), help].join('\n'), 'utf8');
        return console.log(`Readme updated (${file})`);
    }
    throw new ApplicationError('Missing README.md');
});

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
