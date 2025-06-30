import { Argument, Command } from 'commander';
import { ApplicationConfig, defaultJson, getApplicationData } from '../utils/getApplicationData.js';

const configCommand = new Command('config').description('Config');

configCommand
    .command('set')
    .description('Set config')
    .addArgument(new Argument('<key>', 'Config property name'))
    .addArgument(new Argument('<value>', 'Config property value').argParser((value) => JSON.parse(value)))
    .action((key: keyof ApplicationConfig, value) => {
        const appData = getApplicationData();
        if (key in appData.config) {
            appData.config[key] = value;
            appData.$save();
            console.log(`Property '${key}' value changed.`);
        } else {
            console.log(`Missing property '${key}' in config`);
        }
    });

configCommand
    .command('get')
    .description('Get config')
    .addArgument(new Argument('[key]', 'Config property name'))
    .action((key: keyof ApplicationConfig) => {
        const appData = getApplicationData();
        if (key) {
            console.log(appData.config[key]);
        } else {
            Object.entries(appData.config).forEach(([key, value]) => {
                console.log(key, '=', value);
            });
        }
    });

configCommand
    .command('restore')
    .description('Restore config to default')
    .action(() => {
        const appData = getApplicationData();
        appData.config = defaultJson.config;
        appData.$save();
        console.log('Config was restored to default');
    });

export default configCommand;
