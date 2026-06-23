import { defineCommand } from "citty";
import { PROJECT_NAME } from "../common/appConfig";
import { getLatestVersion, updateConsoleMessage } from "../utils/checkUpdates";
import { getPackageJson } from "../utils/getPackageJson";
import { emitJson, isJsonMode } from "../utils/output";
import { jsonArg } from "./sharedArgs";

/** `pkg-sync update-check` — query npm and report whether a newer version is available. */
export const updateCheckCommand = defineCommand({
  meta: { name: "update-check", description: `Check version of '${PROJECT_NAME}'` },
  args: { json: jsonArg },
  async run() {
    const packageJson = getPackageJson(import.meta.dirname);
    const latest = await getLatestVersion(packageJson);
    const upToDate = latest === packageJson.version;

    if (isJsonMode()) {
      emitJson({ current: packageJson.version, latest, upToDate });
    } else if (upToDate) {
      console.log("Package is up to date");
    } else {
      updateConsoleMessage(packageJson, latest);
    }
  },
});
