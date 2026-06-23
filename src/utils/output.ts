/**
 * Output contract for human and machine consumers.
 *
 * stdout carries data only — human text, or a single JSON line in `--json` mode. Diagnostics and
 * notices go to stderr via `note`, so an agent can safely parse `pkg-sync <cmd> --json` from stdout.
 */

let jsonMode = false;

/** Switch the whole process between human output and machine-readable JSON. */
export function setJsonMode(on: boolean): void {
  jsonMode = on;
}

/** Whether commands should emit JSON instead of human text. */
export function isJsonMode(): boolean {
  return jsonMode;
}

/** Emit a command's structured result as a single JSON line on stdout. */
export function emitJson(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data)}\n`);
}

/** Print diagnostics/notices (never data) to stderr, keeping stdout clean. */
export function note(...message: unknown[]): void {
  console.error(...message);
}
