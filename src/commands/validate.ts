import { defineCommand } from "citty";
import { getPackageJson } from "../utils/getPackageJson";
import { getRelatedDependencies } from "../utils/getRelatedDependencies";
import { ApplicationError } from "../models/ApplicationError";
import { depthArg, parseDepth, pathArg } from "./sharedArgs";

/** `pkg-sync validate` — list which registered packages would be synced for a project, without syncing. */
export const validateCommand = defineCommand({
  meta: { name: "validate", description: "Show coverage packages from project" },
  args: {
    path: pathArg,
    depth: depthArg,
  },
  run({ args }) {
    const packageJson = getPackageJson(args.path);
    const packages = getRelatedDependencies(packageJson, parseDepth(args.depth));
    if (packages.length === 0) {
      throw new ApplicationError("No related dependencies found");
    }
    console.log("Dependencies found", ...packages.map(({ name }) => name));
  },
});
