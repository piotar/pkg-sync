import { CommanderError } from 'commander';

export class ApplicationError extends CommanderError {
    constructor(message: string) {
        super(1, 'application.error', message);
    }
}
