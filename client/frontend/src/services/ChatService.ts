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

    static async proxyChat(messages: IMessage[], tools?: any[], connectedExtensions: any[] = []): Promise<IChatResponse> {
        // Create an awareness block if there are connected extensions but we are in tiered mode (discovery)
        let systemPromptSuffix = "";
        if (connectedExtensions.length > 0) {
            systemPromptSuffix = "\n\n**PROTOCOL - Sync & Execute**:\n" +
                "1. Discovery: You only see high-level extensions. Use **mcp_sync(query)** to find specific tools.\n" +
                "2. Memory: Technical schemas for matched tools will appear in your text history (Artifacts/Technical Memory). Read them carefully.\n" +
                "3. Action: Always use **mcp_execute(mcpId, toolName, arguments)** to run a tool once you have its schema from memory. Do NOT attempt to call tech tools directly.\n" +
                "\nConnected Extensions:\n" +
                connectedExtensions.map(e => `- ${e.label} (@${e.handle}): ${e.description}`).join('\n');
        }

        const payload: IChatRequest = {
            messages: messages.map((m, idx) => {
                let role: string = m.type === 'user' ? 'user' : 'assistant';
                if (m.type === 'tool') role = 'tool';

                let content = m.content;
                // Append awareness to the FIRST message if it's a system message, or inject a temporary one
                if (idx === 0 && systemPromptSuffix) {
                    content += systemPromptSuffix;
                }

                return { role, content };
            }),
            tools
        };

        return this.post<IChatResponse>('/v1/chat/', payload);
    }
}
