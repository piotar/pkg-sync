import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { ApplicationError } from "../models/ApplicationError";

/** Walk up from `path` until `name` is found, returning its absolute path or throwing at the root. */
export function findClosestPath(name: string, path = resolve()): string {
  const packagePath = resolve(path, name);

  if (existsSync(packagePath)) {
    return packagePath;
  }

  const parentDirectory = dirname(path);
  if (path === parentDirectory) {
    throw new ApplicationError(`File ${name} not found`);
  }
  return findClosestPath(name, parentDirectory);
}
