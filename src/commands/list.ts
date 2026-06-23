import { defineCommand } from "citty";
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

    console.log("Application data file path:", result.dataFile);
    console.log("Default watch directories:", result.defaultWatchDirs);
    if (result.packages.length === 0) {
      console.log("There are no packages in the list");
      return;
    }
    for (const { name, path, dir } of result.packages) {
      console.log();
      console.log(green(name));
      console.log("Path:", path);
      if (dir) {
        console.log("Custom watch directories:", dir);
      }
    }
  },
});
