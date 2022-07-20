import { request } from 'node:https';
import { getApplicationData } from './getApplicationData';
import { PackageJson } from './getPackageJson';

export function fetch(url: string | URL): Promise<string> {
    return new Promise((resolve, reject) => {
        request(url, (response) => {
            const data: string[] = [];
            response.on('data', (chunk) => data.push(chunk));
            response.on('end', () => resolve(data.join('')));
            response.on('error', (error) => reject(error));
        }).end();
    });
}

export async function checkUpdates(packageJson: PackageJson) {
    const appData = getApplicationData();
    const now = Date.now();

    if (Math.floor((now - appData.updateCheck) / (1000 * 60 * 60 * 24)) < 2) {
        return;
    }
    try {
        const url = new URL(packageJson.name, 'https://registry.npmjs.org/');
        const result = await fetch(url);
        const data = JSON.parse(result);

        if (`dist-tags` in data) {
            const { latest } = data['dist-tags'] ?? {};
            if (latest !== packageJson.version) {
                console.log('Update available!', packageJson.version, '->', latest);
                console.log(`Run "npm install -g ${packageJson.name}" to update.`);
                console.log();
            }
        }
        appData.updateCheck = now;
        appData.$save();
    } catch (error) {
        console.log((error as Error)?.message);
    }
}
