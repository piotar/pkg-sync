import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import { type ApplicationData, getApplicationData } from "../utils/getApplicationData";
import { getPackageJson } from "../utils/getPackageJson";
import { rgb } from "../utils/ansi";
import { textToRgb } from "../utils/textToRgb";
import { emitJson, isJsonMode } from "../utils/output";
import { jsonArg, pathArg } from "./sharedArgs";

/** One active sync as reported by `status`. */
export interface SyncStatus {
  path: string;
  packages: string[];
  syncedAt: number;
  // The target's node_modules is gone, so the recorded sync no longer applies.
  stale: boolean;
}

/** Structured `status` result: every active sync, optionally narrowed to a single target. */
export function statusResult(appData: ApplicationData, target?: string): SyncStatus[] {
  return Object.entries(appData.targets)
    .filter(([path]) => !target || path === target)
    .map(([path, { packages, syncedAt }]) => ({
      path,
      packages,
      syncedAt,
      stale: !existsSync(join(path, "node_modules")),
    }));
}

/** `pkg-sync status` — show which packages are currently synced into which projects. */
export const statusCommand = defineCommand({
  meta: { name: "status", description: "Show active syncs and their target projects" },
  args: {
    path: pathArg,
    json: jsonArg,
  },
  run({ args }) {
    // With a path, narrow to that project; without one, report every recorded target.
    const target = args.path ? getPackageJson(args.path).$dirname : undefined;
    const targets = statusResult(getApplicationData(), target);

    if (isJsonMode()) {
      emitJson({ targets });
      return;
    }

    p.intro("Active syncs");
    if (targets.length === 0) {
      p.outro("Nothing is synced");
      return;
    }

    for (const { path, packages, syncedAt, stale } of targets) {
      const lines = [
        `Packages: ${packages.map((name) => rgb(textToRgb(name), name)).join(", ")}`,
        `Synced at: ${new Date(syncedAt).toLocaleString()}`,
      ];
      if (stale) lines.push("Stale: node_modules is missing");
      p.note(lines.join("\n"), path);
    }
    p.outro(`${targets.length} target(s)`);
  },
});
