#!/usr/bin/env bun
/** pkg-sync CLI entry point — wires the commands into the citty command tree. */

import { defineCommand, runCommand, runMain, showUsage } from "citty";
import { PROJECT_NAME } from "./common/appConfig";
import { addCommand } from "./commands/add";
import { removeCommand } from "./commands/remove";
import { listCommand } from "./commands/list";
import { validateCommand } from "./commands/validate";
import { syncCommand } from "./commands/sync";
import { updateCheckCommand } from "./commands/updateCheck";
import { configCommand } from "./commands/config";
import { getPackageJson } from "./utils/getPackageJson";
import { checkUpdates } from "./utils/checkUpdates";

const packageJson = getPackageJson(import.meta.dirname);

if (!packageJson.$fileExists) {
  throw new Error("Missing package.json");
}

const main = defineCommand({
  meta: {
    name: PROJECT_NAME,
    version: packageJson.version,
    description: packageJson.description ?? "",
  },
  subCommands: {
    add: addCommand,
    remove: removeCommand,
    list: listCommand,
    validate: validateCommand,
    sync: syncCommand,
    "update-check": updateCheckCommand,
    config: configCommand,
  },
});

/** Print a failure as a clean one-liner (full stack only under PKG_SYNC_DEBUG). */
function printError(err: unknown): void {
  if (process.env.PKG_SYNC_DEBUG && err instanceof Error) {
    console.error(err.stack ?? err.message);
  } else {
    console.log(err instanceof Error ? err.message : String(err));
  }
}

async function run(): Promise<void> {
  const argv = process.argv.slice(2);
  const wantsUsage = argv.some((a) => ["--help", "-h", "--version", "-v"].includes(a));

  await checkUpdates(packageJson);

  // citty's runMain owns the --help/--version banners; route normal dispatch through runCommand so
  // expected errors surface as a clean one-liner instead of a stack trace.
  if (wantsUsage) {
    await runMain(main, { rawArgs: argv });
    return;
  }

  try {
    await runCommand(main, { rawArgs: argv });
  } catch (err) {
    // CLIError (unknown/no command, bad args) reads better alongside the usage banner.
    if (err instanceof Error && err.name === "CLIError") await showUsage(main);
    printError(err);
    process.exit(1);
  }
}

void run().catch((err: unknown) => {
  printError(err);
  process.exit(1);
});
