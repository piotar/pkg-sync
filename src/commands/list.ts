import { defineCommand } from "citty";
import { PROJECT_DATA_FILE_PATH } from "../common/appConfig";
import { includeDirectoriesRules } from "../common/watchRules";
import { getApplicationData } from "../utils/getApplicationData";
import { green } from "../utils/ansi";

/** `pkg-sync list` — show the data file location, default watch dirs and every registered package. */
export const listCommand = defineCommand({
  meta: { name: "list", description: "Show all stored packages", alias: "ls" },
  run() {
    console.log("Application data file path:", PROJECT_DATA_FILE_PATH);
    console.log("Default watch directories:", includeDirectoriesRules);

    const appData = getApplicationData();
    const packages = Object.keys(appData.packages);
    if (packages.length === 0) {
      console.log("There are no packages in the list");
      return;
    }

    for (const packageName of packages) {
      const record = appData.packages[packageName];
      if (!record) continue;
      const { path, dir } = record;
      console.log();
      console.log(green(packageName));
      console.log("Path:", path);
      if (dir) {
        console.log("Custom watch directories:", dir);
      }
    }
  },
});
