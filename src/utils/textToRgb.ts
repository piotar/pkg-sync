export type RgbColor = [r: number, g: number, b: number];

export function textToRgb(text?: string): RgbColor {
    const value = text || Math.random().toString(16).split('.')[1];
    const hash = [...value].reduce((result, char) => char.charCodeAt(0) + ((result << 5) - result), 0);
    return Array.from({ length: 3 }, (_, i) => (hash >> (i * 8)) & 0xff) as RgbColor;
}
