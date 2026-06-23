#!/usr/bin/env bun
/** pkg-sync CLI entry point — wires the commands into the citty command tree. */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineCommand, renderUsage, runCommand, runMain, showUsage, type CommandDef } from "citty";
import { PROJECT_NAME } from "./common/appConfig";
import { addCommand } from "./commands/add";
import { removeCommand } from "./commands/remove";
import { listCommand } from "./commands/list";
import { validateCommand } from "./commands/validate";
import { syncCommand } from "./commands/sync";
import { updateCheckCommand } from "./commands/updateCheck";
import { configCommand } from "./commands/config";
import { getPackageJson } from "./utils/getPackageJson";
import { ApplicationError } from "./models/ApplicationError";
import { checkUpdates } from "./utils/checkUpdates";

const packageJson = getPackageJson(import.meta.dirname);

if (!packageJson.$fileExists) {
  throw new Error("Missing package.json");
}

/** Regenerate the README "# Commands" section from each command's usage (hidden maintenance tool). */
const docCommand = defineCommand({
  meta: { name: "doc", description: "Regenerate the README commands section", hidden: true },
  run: () => generateDoc(),
});

const subCommands = {
  add: addCommand,
  remove: removeCommand,
  list: listCommand,
  validate: validateCommand,
  sync: syncCommand,
  "update-check": updateCheckCommand,
  config: configCommand,
  doc: docCommand,
};

const main = defineCommand({
  meta: {
    name: PROJECT_NAME,
    version: packageJson.version,
    description: packageJson.description ?? "",
  },
  subCommands,
});

/** Strip SGR color codes so rendered usage embeds cleanly into Markdown. */
function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

/** Render every visible command's usage and write it under the README "# Commands" header. */
async function generateDoc(): Promise<void> {
  const file = resolve(process.cwd(), "./README.md");
  if (!existsSync(file)) {
    throw new ApplicationError("Missing README.md");
  }

  const readme = readFileSync(file, "utf8").split("\n");
  const commandsHeader = readme.findIndex((line) => line.startsWith("# Commands"));
  if (commandsHeader < 0) {
    throw new ApplicationError("Missing Commands header in README.md");
  }

  const sections = await Promise.all(
    Object.entries(subCommands)
      .filter(([name]) => name !== "doc")
      .map(async ([name, command]) => {
        const usage = stripAnsi(await renderUsage(command as CommandDef, main));
        return [`## ${name}\n`, "```console", usage, "```\n"].join("\n");
      }),
  );

  writeFileSync(file, [...readme.slice(0, commandsHeader + 2), sections.join("\n")].join("\n"), "utf8");
  console.log(`Readme updated (${file})`);
}

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
