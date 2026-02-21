import { IMessage } from '../domain/types';

export class ChatService {
    static createUserMessage(content: string): IMessage {
        return {
            id: Date.now().toString(),
            type: 'user',
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }

    static createAiResponse(query: string): Promise<IMessage> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: (Date.now() + 1).toString(),
                    type: 'ai',
                    content: `Octomus received: "${query}". How can I help with that?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }, 1000);
        });
    }
}
