import { resolve } from 'node:path';
import { JsonFile } from '../models/JsonFile';
import { findClosestFile } from './findClosestFile';

export interface PackageJson {
    name: string;
    version: string;
    description?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
}

export function getPackageJson(
    path?: string,
): JsonFile<PackageJson> & PackageJson {
    return JsonFile.load<PackageJson>(
        findClosestFile('package.json', path ? resolve(path) : undefined),
    );
}
