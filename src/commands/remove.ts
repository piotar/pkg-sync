import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { getPackageJson } from "../utils/getPackageJson";
import { getApplicationData } from "../utils/getApplicationData";
import { ApplicationError } from "../models/ApplicationError";
import { interactiveArg } from "./sharedArgs";

/** `pkg-sync remove` — unregister packages by name, interactively, or all at once. */
export const removeCommand = defineCommand({
  meta: { name: "remove", description: "Remove package from sync", alias: "rm" },
  args: {
    packages: { type: "positional", required: false, description: 'Package name (use "." for the closest package.json)' },
    interactive: interactiveArg,
    all: { type: "boolean", alias: "a", default: false, description: "Remove all stored packages" },
  },
  async run({ args }) {
    const appData = getApplicationData();
    const appPackages = Object.keys(appData.packages);

    // A literal "." stands for the name in the closest package.json.
    const named = args._.map((name) => (name === "." ? getPackageJson().name : name));

    let selectedPackages = args.all ? appPackages : named;
    if (args.interactive && appPackages.length) {
      selectedPackages = await pickPackages(appPackages, args.all ? appPackages : named);
    }

    if (!selectedPackages.length) {
      throw new ApplicationError("No packages provided");
    }

    for (const name of selectedPackages) {
      if (!appData.packages[name]) {
        console.log(`Package '${name}' does not exist in the list`);
      } else {
        console.log(`${name} was removed.`);
        delete appData.packages[name];
      }
    }
    appData.$save();
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
