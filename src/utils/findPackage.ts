import { dirname, resolve } from "node:path";
import { findClosestPath } from "./findClosestPath";
import { getPackageJson, type PackageJsonFile } from "./getPackageJson";

/**
 * Locate an installed dependency's package.json: first in the package's own node_modules, then in
 * the closest node_modules up the tree. Returns a (possibly non-existent) handle either way.
 */
export function findPackage(name: string, path: string): PackageJsonFile {
  const packageJson = getPackageJson(resolve(path, "node_modules", name), true);
  if (packageJson.$fileExists) {
    return packageJson;
  }
  try {
    const nodeModulesPath = findClosestPath("node_modules", dirname(path));
    return getPackageJson(resolve(nodeModulesPath, name), true);
  } catch {
    return packageJson;
  }
}
