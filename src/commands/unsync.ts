import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { getApplicationData } from "../utils/getApplicationData";
import { getPackageJson } from "../utils/getPackageJson";
import { findPackage } from "../utils/findPackage";
import { ApplicationError } from "../models/ApplicationError";
import { emitJson, isJsonMode } from "../utils/output";
import { interactiveArg, jsonArg, pathArg } from "./sharedArgs";

/** `pkg-sync unsync` — remove synced files from a project and restore the published versions. */
export const unsyncCommand = defineCommand({
  meta: { name: "unsync", description: "Remove synced packages from a project and restore them", alias: "restore" },
  args: {
    path: pathArg,
    interactive: interactiveArg,
    reinstall: {
      type: "boolean",
      default: true,
      description: "Reinstall packages to restore published versions",
      negativeDescription: "Only delete synced files, skip reinstall",
    },
    json: jsonArg,
  },
  async run({ args }) {
    const target = getPackageJson(args.path).$dirname;
    const appData = getApplicationData();
    const session = appData.targets[target];
    if (!session) {
      throw new ApplicationError("Nothing synced for this project");
    }

    let selected = session.packages;
    if (args.interactive && process.stdout.isTTY && !isJsonMode() && selected.length) {
      selected = await pickPackages(session.packages);
    }
    if (!selected.length) {
      throw new ApplicationError("No packages selected");
    }

    // Delete each synced package directory; the reinstall (or a manual one) brings back the npm copy.
    const removed = selected.filter((name) => deletePackage(name, target));

    const reinstalled = args.reinstall ? reinstall(target) : false;

    // Drop the unsynced packages from the session, removing the target entirely when none remain.
    const remaining = session.packages.filter((name) => !selected.includes(name));
    if (remaining.length) {
      appData.targets[target] = { ...session, packages: remaining };
    } else {
      delete appData.targets[target];
    }
    appData.$save();

    if (isJsonMode()) {
      emitJson({ unsynced: removed, reinstalled });
      return;
    }
    for (const name of removed) p.log.success(`${name} was unsynced.`);
    if (reinstalled) p.log.success("Reinstalled to restore published versions.");
    else if (args.reinstall) p.log.warn("Could not reinstall; run your package manager's install manually.");
    else p.log.info("Skipped reinstall; run your package manager's install to restore.");
  },
});

/** Remove an installed package's directory from the target. Returns whether anything was deleted. */
function deletePackage(name: string, target: string): boolean {
  const installed = findPackage(name, target);
  if (!installed.$fileExists) return false;
  rmSync(installed.$dirname, { recursive: true, force: true });
  return true;
}

/** Detect the target's package manager from its lockfile and run a fresh install. */
function reinstall(target: string): boolean {
  const manager = detectPackageManager(target);
  // Route child output to stderr so stdout stays clean for `--json` consumers.
  const { status } = spawnSync(manager, ["install"], { cwd: target, stdio: ["ignore", 2, 2], shell: true });
  return status === 0;
}

/** Pick a package manager from the lockfile present in the target, defaulting to npm. */
function detectPackageManager(target: string): string {
  if (existsSync(join(target, "bun.lockb")) || existsSync(join(target, "bun.lock"))) return "bun";
  if (existsSync(join(target, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(target, "yarn.lock"))) return "yarn";
  return "npm";
}

/** Prompt the user to multiselect which synced packages to unsync. */
async function pickPackages(all: string[]): Promise<string[]> {
  const result = await p.multiselect({
    message: "Pick packages to unsync",
    options: all.map((value) => ({ value, label: value })),
    initialValues: all,
    required: false,
  });
  return p.isCancel(result) ? [] : result;
}
