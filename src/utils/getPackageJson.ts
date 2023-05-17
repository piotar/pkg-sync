import { existsSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { JsonFile } from '../models/JsonFile';
import { findClosestPath } from './findClosestPath';
import { getPackageDependencies } from './getPackageDependencies';

export interface PackageJson extends Record<string | symbol, unknown> {
    name: string;
    version: string;
    description?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    $dependencies: Set<string>;
}

export type PackageJsonFile = JsonFile<PackageJson> & PackageJson;

const cache: Map<string, PackageJsonFile> = new Map();

export function getPackageJson(path?: string, staticPath: boolean = false): PackageJsonFile {
    const resolvePath = path ? resolve(path, 'package.json') : resolve('package.json');
    const packagePath = staticPath ? resolvePath : findClosestPath('package.json', resolvePath);
    const absolutePath = existsSync(packagePath) ? realpathSync(packagePath) : packagePath;
    let json = cache.get(absolutePath);
    if (!json) {
        json = new Proxy(JsonFile.load<PackageJson>(absolutePath), {
            get(target, name) {
                return name === '$dependencies' ? getPackageDependencies(target) : target[name];
            },
        });
        cache.set(absolutePath, json);
    }
    return json;
}
