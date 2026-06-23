import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { getPackageJson } from "../utils/getPackageJson";
import { getRelatedDependencies } from "../utils/getRelatedDependencies";
import { ApplicationError } from "../models/ApplicationError";
import { emitJson, isJsonMode } from "../utils/output";
import { depthArg, jsonArg, parseDepth, pathArg } from "./sharedArgs";

/** `pkg-sync validate` — list which registered packages would be synced for a project, without syncing. */
export const validateCommand = defineCommand({
  meta: { name: "validate", description: "Show coverage packages from project" },
  args: {
    path: pathArg,
    depth: depthArg,
    json: jsonArg,
  },
  run({ args }) {
    const packageJson = getPackageJson(args.path);
    const packages = getRelatedDependencies(packageJson, parseDepth(args.depth)).map(({ name }) => name);
    if (packages.length === 0) {
      throw new ApplicationError("No related dependencies found");
    }

    if (isJsonMode()) {
      emitJson({ packages });
    } else {
      p.note(packages.join("\n"), "Dependencies found");
    }
  },
});
