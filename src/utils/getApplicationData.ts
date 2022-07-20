import { JsonFile } from '../models/JsonFile';
import { PROJECT_DATA_FILE_PATH } from '../common/appConfig';

export interface ApplicationDataPackage {
    path: string;
    dir?: string[];
}

export interface ApplicationData {
    version: number;
    updateCheck: number;
    packages: Record<string, ApplicationDataPackage>;
}

const defaultApplicationData: ApplicationData = {
    version: 1,
    updateCheck: Date.now(),
    packages: {},
};

let fileHandler: JsonFile<ApplicationData> & ApplicationData;

export function getApplicationData(): JsonFile<ApplicationData> & ApplicationData {
    if (!fileHandler) {
        fileHandler = JsonFile.load<ApplicationData>(PROJECT_DATA_FILE_PATH, defaultApplicationData);
    }
    return fileHandler;
}
