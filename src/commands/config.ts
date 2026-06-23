import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { type ApplicationConfig, defaultJson, getApplicationData } from "../utils/getApplicationData";
import { emitJson, isJsonMode } from "../utils/output";
import { jsonArg } from "./sharedArgs";

/** `pkg-sync config set <key> <value>` — update a single config value (value parsed as JSON). */
const setCommand = defineCommand({
  meta: { name: "set", description: "Set config" },
  args: {
    key: { type: "positional", required: true, description: "Config property name" },
    value: { type: "positional", required: true, description: "Config property value (JSON)" },
    json: jsonArg,
  },
  run({ args }) {
    const key = args.key as keyof ApplicationConfig;
    const appData = getApplicationData();
    const changed = key in appData.config;
    if (changed) {
      appData.config[key] = JSON.parse(args.value) as ApplicationConfig[typeof key];
      appData.$save();
    }

    if (isJsonMode()) {
      emitJson({ key, value: appData.config[key], changed });
    } else if (changed) {
      p.log.success(`Property '${key}' value changed.`);
    } else {
      p.log.warn(`Missing property '${key}' in config`);
    }
  },
});

/** `pkg-sync config get [key]` — print one value, or every value when no key is given. */
const getCommand = defineCommand({
  meta: { name: "get", description: "Get config" },
  args: {
    key: { type: "positional", required: false, description: "Config property name" },
    json: jsonArg,
  },
  run({ args }) {
    const { config } = getApplicationData();
    const key = args.key as keyof ApplicationConfig | undefined;

    if (isJsonMode()) {
      emitJson(key ? { [key]: config[key] } : { ...config });
    } else if (key) {
      p.log.message(`${key} = ${JSON.stringify(config[key])}`);
    } else {
      const body = Object.entries(config)
        .map(([name, value]) => `${name} = ${JSON.stringify(value)}`)
        .join("\n");
      p.note(body, "Config");
    }
  },
});

/** `pkg-sync config restore` — reset the config back to its defaults. */
const restoreCommand = defineCommand({
  meta: { name: "restore", description: "Restore config to default" },
  args: { json: jsonArg },
  run() {
    const appData = getApplicationData();
    appData.config = defaultJson.config;
    appData.$save();

    if (isJsonMode()) {
      emitJson({ config: appData.config });
    } else {
      p.log.success("Config was restored to default");
    }
  },
});

/** `pkg-sync config` — manage stored settings via set/get/restore subcommands. */
export const configCommand = defineCommand({
  meta: { name: "config", description: "Config" },
  subCommands: {
    set: setCommand,
    get: getCommand,
    restore: restoreCommand,
  },
});
