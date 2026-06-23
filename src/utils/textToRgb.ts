/** A 24-bit color as an [r, g, b] triple. */
export type RgbColor = [r: number, g: number, b: number];

/** Derive a stable RGB color from text, so each package keeps a consistent log color. */
export function textToRgb(text?: string): RgbColor {
  const value = text || Math.random().toString(16).slice(2);
  const hash = [...value].reduce((result, char) => char.charCodeAt(0) + ((result << 5) - result), 0);
  return Array.from({ length: 3 }, (_, i) => (hash >> (i * 8)) & 0xff) as RgbColor;
}
