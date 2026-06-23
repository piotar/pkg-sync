/** Minimal ANSI coloring — replaces chalk with a few escape helpers, honoring NO_COLOR / non-TTY. */

import type { RgbColor } from "./textToRgb";

/** Whether color codes should be emitted (off for NO_COLOR or a non-TTY stdout). */
function enabled(): boolean {
  return !process.env.NO_COLOR && process.stdout.isTTY === true;
}

/** Wrap text in an SGR foreground code, or return it untouched when color is disabled. */
function paint(code: string, text: string): string {
  return enabled() ? `\x1b[${code}m${text}\x1b[39m` : text;
}

/** Color text with a 24-bit RGB foreground (used for per-package log prefixes). */
export function rgb([r, g, b]: RgbColor, text: string): string {
  return paint(`38;2;${r};${g};${b}`, text);
}

/** Green foreground. */
export function green(text: string): string {
  return paint("32", text);
}

/** Bright-yellow foreground. */
export function yellow(text: string): string {
  return paint("93", text);
}
