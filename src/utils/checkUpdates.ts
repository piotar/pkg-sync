import { request } from "node:https";
import { getApplicationData } from "./getApplicationData";
import type { PackageJson } from "./getPackageJson";
import { yellow } from "./ansi";

/** Throttle the startup update check to at most once every two days. */
const CHECK_INTERVAL_DAYS = 2;

/** GET a URL and resolve with the full response body as a string. */
export function fetch(url: string | URL): Promise<string> {
  return new Promise((resolve, reject) => {
    request(url, (response) => {
      const data: string[] = [];
      response.on("data", (chunk: Buffer) => data.push(chunk.toString()));
      response.on("end", () => resolve(data.join("")));
      response.on("error", (error) => reject(error));
    }).end();
  });
}

/** Look up the latest published version on npm, falling back to the current version on any gap. */
export async function getLatestVersion(packageJson: PackageJson): Promise<string> {
  const url = new URL(packageJson.name, "https://registry.npmjs.org/");
  const result = await fetch(url);
  const data = JSON.parse(result) as { "dist-tags"?: { latest?: string } };

  return data["dist-tags"]?.latest ?? packageJson.version;
}

/** Print a friendly "update available" notice. */
export function updateConsoleMessage(packageJson: PackageJson, latest: string): void {
  console.log();
  console.log(yellow(`Update available! ${packageJson.version} -> ${latest}`));
  console.log(yellow(`Run "npm install -g ${packageJson.name}" to update.`));
  console.log();
}

/** Notify about a newer version on startup, throttled and never fatal. */
export async function checkUpdates(packageJson: PackageJson): Promise<void> {
  const appData = getApplicationData();
  const now = Date.now();

  const daysSinceCheck = (now - appData.updateCheck) / (1000 * 60 * 60 * 24);
  if (Math.floor(daysSinceCheck) < CHECK_INTERVAL_DAYS) {
    return;
  }
  try {
    const latest = await getLatestVersion(packageJson);
    if (latest !== packageJson.version) {
      updateConsoleMessage(packageJson, latest);
    }
    appData.updateCheck = now;
    appData.$save();
  } catch (error) {
    console.log((error as Error)?.message);
  }
}
