import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { getPackageJson } from "../utils/getPackageJson";
import { getApplicationData } from "../utils/getApplicationData";
import { ApplicationError } from "../models/ApplicationError";
import { emitJson, isJsonMode } from "../utils/output";
import { interactiveArg, jsonArg } from "./sharedArgs";

/** Split requested names into those present in the registry and those that are unknown. */
export function partitionRemovals(registered: string[], requested: string[]): { removed: string[]; missing: string[] } {
  const known = new Set(registered);
  return {
    removed: requested.filter((name) => known.has(name)),
    missing: requested.filter((name) => !known.has(name)),
  };
}

/** `pkg-sync remove` — unregister packages by name, interactively, or all at once. */
export const removeCommand = defineCommand({
  meta: { name: "remove", description: "Remove package from sync", alias: "rm" },
  args: {
    packages: { type: "positional", required: false, description: 'Package name (use "." for the closest package.json)' },
    interactive: interactiveArg,
    all: { type: "boolean", alias: "a", default: false, description: "Remove all stored packages" },
    json: jsonArg,
  },
  async run({ args }) {
    const appData = getApplicationData();
    const appPackages = Object.keys(appData.packages);

    // A literal "." stands for the name in the closest package.json.
    const named = args._.map((name) => (name === "." ? getPackageJson().name : name));

    let selected = args.all ? appPackages : named;
    if (args.interactive && process.stdout.isTTY && !isJsonMode() && appPackages.length) {
      selected = await pickPackages(appPackages, args.all ? appPackages : named);
    }

    if (!selected.length) {
      throw new ApplicationError("No packages provided");
    }

    const { removed, missing } = partitionRemovals(appPackages, selected);
    for (const name of removed) {
      delete appData.packages[name];
    }
    appData.$save();

    if (isJsonMode()) {
      emitJson({ removed, missing });
      return;
    }
    for (const name of removed) console.log(`${name} was removed.`);
    for (const name of missing) console.log(`Package '${name}' does not exist in the list`);
  },
});

/** Prompt the user to multiselect packages, with the given ones preselected. */
async function pickPackages(all: string[], preselected: string[]): Promise<string[]> {
  const result = await p.multiselect({
    message: "Pick packages to remove",
    options: all.map((value) => ({ value, label: value })),
    initialValues: all.filter((value) => preselected.includes(value)),
    required: false,
  });
  return p.isCancel(result) ? [] : result;
}
