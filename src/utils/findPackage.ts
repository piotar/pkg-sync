import { dirname, resolve } from 'node:path';
import { findClosestPath } from './findClosestPath';
import { getPackageJson, PackageJsonFile } from './getPackageJson';

export function findPackage(name: string, path: string): PackageJsonFile {
    const packageJson = getPackageJson(resolve(path, 'node_modules', name));
    if (packageJson.$fileExists) {
        return packageJson;
    }
    try {
        return getPackageJson(findClosestPath('node_modules', dirname(path)));
    } catch (e) {
        return packageJson;
    }
}
