import { PackageJson } from './getPackageJson.js';

export function getPackageDependencies(packageJson: PackageJson): Set<string> {
    return new Set<string>([
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.devDependencies ?? {}),
        ...Object.keys(packageJson.peerDependencies ?? {}),
    ]);
}
