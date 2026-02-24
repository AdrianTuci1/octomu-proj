import { ExecuteSystemCommand } from '../../../../bindings/client/app';

export interface ICommandInfrastructure {
    executeSystemCommand(command: string, args: string[]): Promise<string>;
}

export class CommandInfrastructure implements ICommandInfrastructure {
    async executeSystemCommand(command: string, args: string[]): Promise<string> {
        try {
            const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command;
            return await ExecuteSystemCommand(fullCommand);
        } catch (error) {
            console.error('[CommandInfrastructure] Sync error:', error);
            throw error;
        }
    }
}
