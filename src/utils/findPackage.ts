import { dirname, resolve } from 'node:path';
import { findClosestPath } from './findClosestPath.js';
import { getPackageJson, PackageJsonFile } from './getPackageJson.js';

export function findPackage(name: string, path: string): PackageJsonFile {
    const packageJson = getPackageJson(resolve(path, 'node_modules', name), true);
    if (packageJson.$fileExists) {
        return packageJson;
    }
    try {
        const nodeModulesPath = findClosestPath('node_modules', dirname(path));
        return getPackageJson(resolve(nodeModulesPath, name), true);
    } catch (e) {
        return packageJson;
    }
}
