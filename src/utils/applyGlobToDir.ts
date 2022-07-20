export function applyGlobToDir(dirname: string): string {
    return `${dirname}/**/*`;
}

export function applyGlobToDirs(collection: string[]): string[] {
    return [...collection, ...collection.map(applyGlobToDir)];
}
