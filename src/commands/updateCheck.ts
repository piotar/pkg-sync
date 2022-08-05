import { Command } from 'commander';
import { PROJECT_NAME } from '../common/appConfig';
import { getLatestVersion, updateConsoleMessage } from '../utils/checkUpdates';
import { getPackageJson } from '../utils/getPackageJson';

export default new Command('update-check').description(`Check version of '${PROJECT_NAME}'`).action(async () => {
    const packageJson = getPackageJson(__dirname);
    const latest = await getLatestVersion(packageJson);

    if (latest === packageJson.version) {
        console.log('Package is up to date');
    } else {
        updateConsoleMessage(packageJson, latest);
    }
});
