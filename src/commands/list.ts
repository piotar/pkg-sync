import chalk from 'chalk';
import { Command } from 'commander';
import { PROJECT_DATA_FILE_PATH } from '../common/appConfig';
import { includeDirectoriesRules } from '../common/watchRules';
import { getApplicationData } from '../utils/getApplicationData';

export default new Command('list')
    .alias('ls')
    .description('Show all stored packages')
    .action(() => {
        console.log('Application data file path:', PROJECT_DATA_FILE_PATH);
        console.log('Default watch directories:', includeDirectoriesRules);
        const appData = getApplicationData();
        const packages = Object.keys(appData.packages);
        if (packages.length) {
            Object.keys(appData.packages).forEach((packageName) => {
                const { path, dir } = appData.packages[packageName];
                console.log();
                console.log(chalk.green`${packageName}`);
                console.log('Path:', path);
                if (dir) {
                    console.log('Custom watch directories:', dir);
                }
            });
        } else {
            console.log('There are no packages in the list');
        }
    });
