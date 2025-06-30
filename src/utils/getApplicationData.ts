import { JsonFile } from '../models/JsonFile.js';
import { PROJECT_DATA_FILE_PATH } from '../common/appConfig.js';

export interface ApplicationDataPackage {
    path: string;
    dir?: string[];
}

export interface ApplicationConfig {
    depth: number;
}

export interface ApplicationData extends Record<string | symbol, unknown> {
    version: number;
    updateCheck: ReturnType<typeof Date.now>;
    packages: Record<string, ApplicationDataPackage>;
    config: ApplicationConfig;
}

export const defaultJson: ApplicationData = {
    version: 1,
    updateCheck: Date.now(),
    packages: {},
    config: {
        depth: 2,
    },
};

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

export function getApplicationData(): ApplicationDataFile {
    if (!fileHandler) {
        fileHandler = JsonFile.load<ApplicationData>(PROJECT_DATA_FILE_PATH, { defaultJson, transform });
    }
    return fileHandler;
}
