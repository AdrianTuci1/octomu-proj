import { IMessage } from '../../../domain/types';

export interface IChatInfrastructure {
    // In the future, this would call backend APIs
    sendMessage(content: string): Promise<void>;
}

export class ChatInfrastructure implements IChatInfrastructure {
    async sendMessage(content: string): Promise<void> {
        // Mock or real backend call
        console.log('[ChatInfrastructure] Sending message:', content);
    }
}
