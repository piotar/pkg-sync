import { findPackage } from "./findPackage";
import type { PackageJsonFile } from "./getPackageJson";

/** A node in the resolved dependency tree; `dedupe` marks a package already seen elsewhere. */
export interface PackageDependency {
  dependency: PackageJsonFile;
  dependencies?: PackageDependency[];
  dedupe?: boolean;
}

/** The full resolution result: the tree plus a flat map of every unique package. */
export interface PackageDependencies {
  dependencies: PackageDependency[];
  packages: Map<PackageJsonFile, PackageDependency>;
}

/** Recursively resolve a package's dependencies up to `depth`, deduplicating repeats. */
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

    // Recurse only into newly seen, existing packages while depth remains.
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
