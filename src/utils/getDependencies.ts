import { findPackage } from './findPackage.js';
import { PackageJson, PackageJsonFile } from './getPackageJson.js';

export interface PackageDependency {
    dependency: PackageJsonFile;
    dependencies?: PackageDependency[];
    dedupe?: boolean;
}

export interface PackageDependencies {
    dependencies: PackageDependency[];
    packages: Map<PackageJsonFile, PackageDependency>;
}

export function getDependencies(
    packageJson: PackageJsonFile,
    depth: number,
    packages: Map<PackageJsonFile, PackageDependency> = new Map<PackageJsonFile, PackageDependency>(),
): PackageDependencies {
    const dependencies: PackageDependency[] = [];

    for (const packageName of packageJson.$dependencies) {
        const dependency = findPackage(packageName, packageJson.$dirname);
        const cached = packages.get(dependency);
        const result: PackageDependency = {
            dependency,
            dedupe: !!cached,
        };
        packages.set(result.dependency, result);

        if (!cached && result.dependency.$fileExists && depth > 0) {
            const packageDependencies = getDependencies(result.dependency, depth - 1, packages);
            result.dependencies = packageDependencies.dependencies;
        }

        dependencies.push(cached ?? result);
    }

    return {
        dependencies,
        packages,
    };
}
