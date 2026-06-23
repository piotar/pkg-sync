import type { ArgDef } from "citty";
import { getApplicationData } from "../utils/getApplicationData";

/** Optional path to the target package; defaults to the closest package.json when omitted. */
export const pathArg = {
  type: "positional",
  required: false,
  description: "Path to package (path not set will be set to closest package.json)",
} as const satisfies ArgDef;

/** Enable interactive multiselect prompts. */
export const interactiveArg = {
  type: "boolean",
  alias: "i",
  default: false,
  description: "Interactive mode",
} as const satisfies ArgDef;

/** Dependency search depth; defaults to the stored config value. */
export const depthArg = {
  type: "string",
  alias: "d",
  default: String(getApplicationData().config.depth),
  description: "Deep search of dependencies",
} as const satisfies ArgDef;

/** Parse a depth argument string into a number. */
export function parseDepth(value: string): number {
  return parseInt(value, 10);
}
