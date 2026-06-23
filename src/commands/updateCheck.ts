import { defineCommand } from "citty";
import { PROJECT_NAME } from "../common/appConfig";
import { getLatestVersion, updateConsoleMessage } from "../utils/checkUpdates";
import { getPackageJson } from "../utils/getPackageJson";

/** `pkg-sync update-check` — query npm and report whether a newer version is available. */
export const updateCheckCommand = defineCommand({
  meta: { name: "update-check", description: `Check version of '${PROJECT_NAME}'` },
  async run() {
    const packageJson = getPackageJson(import.meta.dirname);
    const latest = await getLatestVersion(packageJson);

    if (latest === packageJson.version) {
      console.log("Package is up to date");
    } else {
      updateConsoleMessage(packageJson, latest);
    }
  },
});
