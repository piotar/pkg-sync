import { Argument, Command, Option } from 'commander';
import { ApplicationError } from '../models/ApplicationError';
import { getLockData } from '../utils/getLockData';
import { getPackageJson } from '../utils/getPackageJson';
import pathArgument from './arguments/path';

const restoreCommand = new Command('restore').description('Restore replaced packages');

restoreCommand
    .command('list')
    .alias('ls')
    .description('Restore entries')
    .addArgument(pathArgument)
    .action((path) => {
        const packageJson = getPackageJson(path);
        const lockData = getLockData(packageJson.$dirname);

        if (!lockData.entries.length) {
            throw new ApplicationError('There is no entries in lock file');
        }
        console.table(lockData.entries);
    });

restoreCommand
    .command('remove')
    .alias('rm')
    .description('Remove and clear entry by ids')
    .addOption(new Option('-a, --all', 'Remove all entries').default(false))
    .addArgument(pathArgument)
    .addArgument(new Argument('[entries...]', 'Entry id'))
    .action((path: string, entries: string[] = [], options: { all: boolean }) => {
        const packageJson = getPackageJson(path);
        const lockData = getLockData(packageJson.$dirname);
        if (!lockData.entries.length) {
            throw new ApplicationError('There is no entries in lock file');
        }

        let selectedEntries = entries;
        if (options.all) {
            selectedEntries = lockData.entries.map((entry) => entry.id);
        } else {
            const latest = lockData.entries[lockData.entries.length - 1];
            selectedEntries = entries.map((id) => (id === 'latest' ? latest.id : id));
        }

        if (!selectedEntries.length) {
            throw new ApplicationError('No entries found');
        }

        lockData.$remove(selectedEntries);
        console.log('lock removed');
    });

restoreCommand
    .command('entry')
    .addArgument(pathArgument)
    .addArgument(new Argument('<id>', 'Stored session id')) // need latest
    .addOption(new Option('--no-remove', 'Remove from list'))
    .action((path: string, id: string, options: { remove: boolean }) => {
        const packageJson = getPackageJson(path);
        const lockData = getLockData(packageJson.$dirname);
        const entryLock = lockData.entries.find((entry) => entry.id === id);
        if (!entryLock) {
            throw new ApplicationError(`There is no entry lock with id '${id}'`);
        }

        lockData.$restore(entryLock.id, options.remove);
        console.log('restored');
    });

export default restoreCommand;
