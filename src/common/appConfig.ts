import { homedir } from 'node:os';
import { resolve } from 'node:path';

export const PROJECT_NAME = 'pkg-sync';
export const PROJECT_DIR = `.${PROJECT_NAME}`;
export const PROJECT_DIR_PATH = resolve(homedir(), PROJECT_DIR);
export const PROJECT_DATA_FILE = 'data.json';
export const PROJECT_DATA_FILE_PATH = resolve(
    PROJECT_DIR_PATH,
    PROJECT_DATA_FILE,
);
