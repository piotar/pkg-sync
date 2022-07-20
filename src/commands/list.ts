import { Command } from 'commander';
import { PROJECT_DATA_FILE_PATH } from '../common/appConfig';
import { getApplicationData } from '../utils/getApplicationData';

export default new Command('list')
    .alias('ls')
    .description('Show all stored packages')
    .action(() => {
        console.log('Application data file path:', PROJECT_DATA_FILE_PATH);
        const appData = getApplicationData();
        const packages = Object.keys(appData.packages);
        if (packages.length) {
            console.table(appData.packages);
        } else {
            console.log('There are no packages in the list');
        }
    });
