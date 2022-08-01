import { getApplicationData } from './getApplicationData';
import { getDependencies } from './getDependencies';
import { PackageJsonFile } from './getPackageJson';

export function getRelatedDependencies(packageJson: PackageJsonFile, depth: number): PackageJsonFile[] {
    const { packages } = getDependencies(packageJson, depth);
    const storedPackages = Object.keys(getApplicationData().packages);
    return [...packages.keys()].filter((dependencyPackage) => storedPackages.includes(dependencyPackage.name));
}
