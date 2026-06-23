import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import picomatch from "picomatch";
import { getPackageJson, type PackageJsonFile } from "../utils/getPackageJson";
import { getRelatedDependencies } from "../utils/getRelatedDependencies";
import { getApplicationData } from "../utils/getApplicationData";
import { excludeRules, includeDirectoriesRules, matcherOptions } from "../common/watchRules";
import { SyncWatcher } from "../models/SyncWatcher";
import { ApplicationError } from "../models/ApplicationError";
import { applyGlobToDirs } from "../utils/applyGlobToDir";
import { emitJson, isJsonMode } from "../utils/output";
import { depthArg, interactiveArg, jsonArg, parseDepth, pathArg } from "./sharedArgs";

/** `pkg-sync sync` — copy registered dependencies into a project and (by default) keep watching them. */
export const syncCommand = defineCommand({
  meta: { name: "sync", description: "Sync and watch packages in project" },
  args: {
    path: pathArg,
    watch: { type: "boolean", default: true, description: "Watch files after sync", negativeDescription: "Disable watch files after sync" },
    interactive: interactiveArg,
    depth: depthArg,
    json: jsonArg,
  },
  async run({ args }) {
    const packageJson = getPackageJson(args.path);
    const relatedDependencies = getRelatedDependencies(packageJson, parseDepth(args.depth));

    // Positional args after the path are explicit package names to limit the sync to.
    const packagesToSync = args._.slice(1);
    let relatedPackages =
      packagesToSync.length > 0
        ? relatedDependencies.filter((pkg) => packagesToSync.includes(pkg.name))
        : relatedDependencies;

    if (args.interactive && process.stdout.isTTY && !isJsonMode() && relatedDependencies.length) {
      relatedPackages = await pickPackages(relatedDependencies, relatedPackages);
    }

    if (!relatedPackages.length) {
      throw new ApplicationError("No related dependencies found");
    }

    const synced = relatedPackages.map(({ name }) => name);
    if (!isJsonMode()) {
      console.log("Dependencies to synchronization", ...synced);
    }

    const watchers = relatedPackages.map((pkg) => createWatcher(pkg));
    watchers.forEach((watcher) => watcher.copy());

    if (args.watch) {
      watchers.forEach((watcher) => watcher.watch());
    }

    if (isJsonMode()) {
      emitJson({ synced, watch: args.watch });
    }
  },
});

/** Build a SyncWatcher for one dependency, using its custom dirs or the defaults. */
function createWatcher(dependencyPackage: PackageJsonFile): SyncWatcher {
  const packageRecord = getApplicationData().packages[dependencyPackage.name];
  if (!packageRecord) {
    throw new ApplicationError(`Package '${dependencyPackage.name}' is not registered`);
  }
  const exclude = picomatch(excludeRules, matcherOptions);
  const include = packageRecord.dir?.length
    ? picomatch(applyGlobToDirs(packageRecord.dir), matcherOptions)
    : picomatch(applyGlobToDirs(includeDirectoriesRules), matcherOptions);

  return new SyncWatcher(packageRecord.path, dependencyPackage.$dirname, {
    name: dependencyPackage.name,
    include,
    exclude,
  });
}

/** Prompt the user to multiselect packages to sync, with the given ones preselected. */
async function pickPackages(all: PackageJsonFile[], preselected: PackageJsonFile[]): Promise<PackageJsonFile[]> {
  const result = await p.multiselect({
    message: "Pick packages to sync",
    options: all.map((pkg) => ({ value: pkg.name, label: pkg.name })),
    initialValues: preselected.map((pkg) => pkg.name),
    required: false,
  });
  if (p.isCancel(result)) return [];
  return all.filter((pkg) => result.includes(pkg.name));
}
