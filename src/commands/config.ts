import { defineCommand } from "citty";
import { type ApplicationConfig, defaultJson, getApplicationData } from "../utils/getApplicationData";

/** `pkg-sync config set <key> <value>` — update a single config value (value parsed as JSON). */
const setCommand = defineCommand({
  meta: { name: "set", description: "Set config" },
  args: {
    key: { type: "positional", required: true, description: "Config property name" },
    value: { type: "positional", required: true, description: "Config property value (JSON)" },
  },
  run({ args }) {
    const key = args.key as keyof ApplicationConfig;
    const appData = getApplicationData();
    if (key in appData.config) {
      appData.config[key] = JSON.parse(args.value) as ApplicationConfig[typeof key];
      appData.$save();
      console.log(`Property '${key}' value changed.`);
    } else {
      console.log(`Missing property '${key}' in config`);
    }
  },
});

/** `pkg-sync config get [key]` — print one value, or every value when no key is given. */
const getCommand = defineCommand({
  meta: { name: "get", description: "Get config" },
  args: {
    key: { type: "positional", required: false, description: "Config property name" },
  },
  run({ args }) {
    const appData = getApplicationData();
    if (args.key) {
      console.log(appData.config[args.key as keyof ApplicationConfig]);
    } else {
      for (const [key, value] of Object.entries(appData.config)) {
        console.log(key, "=", value);
      }
    }
  },
});

/** `pkg-sync config restore` — reset the config back to its defaults. */
const restoreCommand = defineCommand({
  meta: { name: "restore", description: "Restore config to default" },
  run() {
    const appData = getApplicationData();
    appData.config = defaultJson.config;
    appData.$save();
    console.log("Config was restored to default");
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
