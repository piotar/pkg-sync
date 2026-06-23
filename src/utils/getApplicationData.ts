import { JsonFile } from "../models/JsonFile";
import { PROJECT_DATA_FILE_PATH } from "../common/appConfig";

/** A registered package: where it lives and, optionally, which dirs to watch. */
export interface ApplicationDataPackage {
  path: string;
  dir?: string[];
}

/** User-tunable settings. */
export interface ApplicationConfig {
  depth: number;
}

/** An active sync: which packages were mirrored into a target project, and when. */
export interface SyncSession {
  packages: string[];
  syncedAt: ReturnType<typeof Date.now>;
}

/** The on-disk shape of `~/.pkg-sync/data.json`. */
export interface ApplicationData extends Record<string | symbol, unknown> {
  version: number;
  updateCheck: ReturnType<typeof Date.now>;
  packages: Record<string, ApplicationDataPackage>;
  config: ApplicationConfig;
  // Active syncs keyed by the target project's absolute path.
  targets: Record<string, SyncSession>;
}

/** Values used when the data file is missing or partial. */
export const defaultJson: ApplicationData = {
  version: 1,
  updateCheck: Date.now(),
  packages: {},
  config: {
    depth: 2,
  },
  targets: {},
};

/** Merge stored data over the defaults so new fields always have a value. */
function transform(data: Partial<ApplicationData>): ApplicationData {
  return {
    ...defaultJson,
    ...data,
    config: {
      ...defaultJson.config,
      ...data.config,
    },
  };
}

export type ApplicationDataFile = JsonFile<ApplicationData> & ApplicationData;

let fileHandler: ApplicationDataFile;

/** Load the application data once and reuse the same handler for the rest of the process. */
export function getApplicationData(): ApplicationDataFile {
  if (!fileHandler) {
    fileHandler = JsonFile.load<ApplicationData>(PROJECT_DATA_FILE_PATH, { defaultJson, transform });
  }
  return fileHandler;
}
