/** Turn a directory name into a recursive glob that matches everything beneath it. */
export function applyGlobToDir(dirname: string): string {
  return `${dirname}/**/*`;
}

/** Expand each directory to both its literal name and its recursive glob. */
export function applyGlobToDirs(collection: string[]): string[] {
  return [...collection, ...collection.map(applyGlobToDir)];
}
