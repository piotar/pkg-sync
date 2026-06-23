import type { PackageJson } from "./getPackageJson";

/** Collect the names of all runtime, dev and peer dependencies into one deduplicated set. */
export function getPackageDependencies(packageJson: PackageJson): Set<string> {
  return new Set<string>([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ]);
}
