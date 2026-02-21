import { IPendingCommand, IMessage } from '../domain/types';

export class TerminalService {
    static parseCommand(query: string): IPendingCommand | null {
        if (query.startsWith('$')) {
            return {
                id: Date.now().toString(),
                command: query.slice(1).trim()
            };
        }
        return null;
    }

    static createExecutionResultMessage(command: string): IMessage {
        return {
            id: Date.now().toString(),
            type: 'user',
            content: `Executed: ${command}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }
}
