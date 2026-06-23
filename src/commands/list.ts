import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { PROJECT_DATA_FILE_PATH } from "../common/appConfig";
import { includeDirectoriesRules } from "../common/watchRules";
import { type ApplicationData, getApplicationData } from "../utils/getApplicationData";
import { green } from "../utils/ansi";
import { emitJson, isJsonMode } from "../utils/output";
import { jsonArg } from "./sharedArgs";

/** One registered package as reported by `list`. */
interface ListedPackage {
  name: string;
  path: string;
  dir?: string[];
}

/** Structured `list` result: where state lives, the default watch dirs, and every package. */
export function listResult(appData: ApplicationData): {
  dataFile: string;
  defaultWatchDirs: string[];
  packages: ListedPackage[];
} {
  const packages = Object.entries(appData.packages).map(([name, { path, dir }]) => ({ name, path, dir }));
  return { dataFile: PROJECT_DATA_FILE_PATH, defaultWatchDirs: includeDirectoriesRules, packages };
}

/** `pkg-sync list` — show the data file location, the default watch dirs and every registered package. */
export const listCommand = defineCommand({
  meta: { name: "list", description: "Show all stored packages", alias: "ls" },
  args: { json: jsonArg },
  run() {
    const result = listResult(getApplicationData());

    if (isJsonMode()) {
      emitJson(result);
      return;
    }

    p.intro("Registered packages");
    p.log.info(`Data file: ${result.dataFile}`);
    p.log.info(`Default watch directories: ${result.defaultWatchDirs.join(", ")}`);

    if (result.packages.length === 0) {
      p.outro("There are no packages in the list");
      return;
    }

    for (const { name, path, dir } of result.packages) {
      const lines = [`Path: ${path}`];
      if (dir) {
        lines.push(`Custom watch directories: ${dir.join(", ")}`);
      }
      p.note(lines.join("\n"), green(name));
    }
    p.outro(`${result.packages.length} package(s)`);
  },
});
