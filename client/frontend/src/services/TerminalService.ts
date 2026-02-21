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
        // Simple mock result based on command
        let mockResult = `Result for ${command}: Success. Found relevant information about Machine Learning trends in 2026.`;
        if (command.includes('search')) {
            mockResult = `Found 3 main updates: 1. GPT-5 training status, 2. New Anthropic multimodal models, 3. Optimized GPU training techniques.`;
        }

        return {
            id: Date.now().toString(),
            type: 'tool',
            content: mockResult,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }
}
