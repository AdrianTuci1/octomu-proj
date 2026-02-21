import { IMessage } from '../domain/types';
import { ApiService } from './ApiService';

export interface IChatRequest {
    messages: { role: string; content: string }[];
    tools?: any[];
}

export interface IChatResponse {
    role: string;
    content?: string;
    tool_call?: {
        name: string;
        arguments: any;
    };
}

export class ChatService extends ApiService {
    static createUserMessage(content: string): IMessage {
        return {
            id: Date.now().toString(),
            type: 'user',
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }

    static async proxyChat(messages: IMessage[], tools?: any[]): Promise<IChatResponse> {
        const payload: IChatRequest = {
            messages: messages.map(m => {
                let role: string = m.type === 'user' ? 'user' : 'assistant';
                if (m.type === 'tool') role = 'tool';
                return { role, content: m.content };
            }),
            tools
        };

        return this.post<IChatResponse>('/v1/chat/', payload);
    }
}
