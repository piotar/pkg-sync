import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { getApplicationData } from "../utils/getApplicationData";
import { getPackageJson } from "../utils/getPackageJson";
import { ApplicationError } from "../models/ApplicationError";
import { emitJson, isJsonMode } from "../utils/output";
import { jsonArg, pathArg } from "./sharedArgs";

/** `pkg-sync add` — register a package (by its path) so it can be synced into other projects. */
export const addCommand = defineCommand({
  meta: { name: "add", description: "Add package to sync" },
  args: {
    path: pathArg,
    name: { type: "string", alias: "n", description: "Package name (override name from package.json)" },
    force: { type: "boolean", alias: "f", default: false, description: "Override package" },
    dir: { type: "string", alias: "d", description: "Directories to watch, comma-separated (override defaults)" },
    json: jsonArg,
  },
  run({ args }) {
    const packageJson = getPackageJson(args.path);
    const name = args.name ?? packageJson.name;

    const appData = getApplicationData();
    if (appData.packages[name] && !args.force) {
      throw new ApplicationError('Package already exists, use "--force" flag to override it');
    }

    const record = { path: packageJson.$dirname, dir: parseDirs(args.dir) };
    appData.packages[name] = record;
    appData.$save();

    if (isJsonMode()) {
      emitJson({ added: name, path: record.path, dir: record.dir });
    } else {
      p.log.success(`${name} was added.`);
    }
  },
});

/** Split a comma-separated `--dir` value into a clean list, or undefined when not given. */
function parseDirs(dir?: string): string[] | undefined {
  if (!dir) return undefined;
  const dirs = dir
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return dirs.length > 0 ? dirs : undefined;
}
