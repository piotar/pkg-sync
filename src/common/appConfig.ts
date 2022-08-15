import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { generateId } from '../utils/generateId';

export const PROJECT_NAME = 'pkg-sync';
export const PROJECT_DIR = `.${PROJECT_NAME}`;
export const PROJECT_DIR_PATH = resolve(homedir(), PROJECT_DIR);
export const PROJECT_DATA_FILE = 'data.json';
export const PROJECT_DATA_FILE_PATH = resolve(PROJECT_DIR_PATH, PROJECT_DATA_FILE);
export const PROJECT_LOCK_FILE = 'lock.json';
export const PROJECT_ARCHIVE_DIR = 'packages';
export const SESSION_ID = generateId();
