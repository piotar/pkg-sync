import { getApplicationData } from './getApplicationData.js';
import { getDependencies } from './getDependencies.js';
import { PackageJsonFile } from './getPackageJson.js';

export function getRelatedDependencies(packageJson: PackageJsonFile, depth: number): PackageJsonFile[] {
    const { packages } = getDependencies(packageJson, depth);
    const storedPackages = Object.keys(getApplicationData().packages);
    return [...packages.keys()].filter((dependencyPackage) => storedPackages.includes(dependencyPackage.name));
}
