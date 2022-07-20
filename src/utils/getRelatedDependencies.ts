import { getApplicationData } from './getApplicationData';
import { PackageJson } from './getPackageJson';

export function getRelatedDependencies(packageJson: PackageJson): string[] {
    const dependencies = [
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.devDependencies ?? {}),
        ...Object.keys(packageJson.peerDependencies ?? {}),
    ];

    const appData = getApplicationData();
    return Object.keys(appData.packages).filter((dependency) =>
        dependencies.includes(dependency),
    );
}
