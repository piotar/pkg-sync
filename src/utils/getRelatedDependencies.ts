import { getApplicationData } from "./getApplicationData";
import { getDependencies } from "./getDependencies";
import type { PackageJsonFile } from "./getPackageJson";

/** Resolve a project's dependency tree and keep only the packages registered for syncing. */
export function getRelatedDependencies(packageJson: PackageJsonFile, depth: number): PackageJsonFile[] {
  const { packages } = getDependencies(packageJson, depth);
  const storedPackages = Object.keys(getApplicationData().packages);
  return [...packages.keys()].filter((dependencyPackage) => storedPackages.includes(dependencyPackage.name));
}
