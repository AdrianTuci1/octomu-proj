import { AppState } from '../../storeTypes';
import { ChatService } from '../../../services/ChatService';
import { TerminalService } from '../../../services/TerminalService';
import { ROUTER_TOOLS } from '../../../services/systemTools';
import { IMessage } from '../../../domain/types';

export class ChatCommandHandler {
    static async handleSubmit(set: any, get: any) {
        const { query, typingQuery, isChatMode, selectedIndex, results, chatSessions, currentView, showMentions, extensions, addMention, registry, sessionArtifacts } = get() as AppState;

        if (showMentions && selectedIndex >= 0) {
            const lastWord = typingQuery.split(' ').pop() || '';
            const filter = lastWord.startsWith('@') ? lastWord.slice(1).toLowerCase() : '';
            const filteredExts = extensions.filter(ex => ex.label.toLowerCase().includes(filter) || ex.handle.toLowerCase().includes(filter));
            const selected = filteredExts[selectedIndex];
            if (selected) { addMention(selected); return; }
        }

        if (currentView === 'authorizations') {
            const focusedItem = registry[selectedIndex];
            if (focusedItem) { set({ selectedIntegrationId: focusedItem.id, currentView: 'mcpDetail', selectedIndex: 0 }); }
            return;
        }

        // --- NEW: Handle Search Mode Enter ---
        if (!isChatMode && query.trim().length > 0) {
            const { handleResultSelection, selectChat, results, chatSessions } = get() as AppState;

            // Re-calculate filtered results to find the focused item
            const filteredResults = results.filter(r =>
                r.label.toLowerCase().includes(query.toLowerCase()) ||
                r.category.toLowerCase().includes(query.toLowerCase())
            );

            if (selectedIndex < filteredResults.length) {
                const selected = filteredResults[selectedIndex];
                if (selected) {
                    handleResultSelection(selected);
                    return;
                }
            } else if (selectedIndex < filteredResults.length + chatSessions.length) {
                const sessionIndex = selectedIndex - filteredResults.length;
                const session = chatSessions[sessionIndex];
                if (session) {
                    selectChat(session.id);
                    return;
                }
            }
        }

        if (!query.trim()) return;

        const cmd = TerminalService.parseCommand(query);
        if (cmd) {

            set({ pendingCommand: cmd, query: '', typingQuery: '', currentView: 'main' });
            return;
        }

        if (isChatMode || query.trim().length > 0) {
            const userMsg = ChatService.createUserMessage(query);
            const currentConversation = [...get().conversation, userMsg];

            set({ conversation: currentConversation, query: '', typingQuery: '', currentView: 'main', isChatMode: true });

            const connectedMCPs = (registry || []).filter(e => e.status === 'connected');

            // ── Schemaless Execute: Only send Protocol Tools to backend ──────────
            const toolsForLLM = [...ROUTER_TOOLS];

            // Inject pinned schemas as Technical Memory in the conversation
            let technicalMemory = "";
            if (sessionArtifacts.length > 0) {
                technicalMemory = "TECHNICAL MEMORY (Artifacts):\n" +
                    sessionArtifacts.map(a => `Tool: ${a.name} (MCP: ${a.mcpId})\nDescription: ${a.description}\nSchema: ${JSON.stringify(a.inputSchema || a.parameters)}`).join("\n---\n") +
                    "\n\nTo use these tools, call mcp_execute with the appropriate arguments.";
            }

            const conversationWithMemory = [...currentConversation];
            if (technicalMemory) {
                conversationWithMemory.push({
                    id: `tech-mem-${Date.now()}`,
                    type: 'system' as any,
                    content: technicalMemory,
                    timestamp: new Date().toLocaleTimeString()
                });
            }

            try {
                const response = await ChatService.proxyChat(conversationWithMemory, toolsForLLM, connectedMCPs);

                if (response.content) {
                    set((state: AppState) => ({
                        conversation: [...state.conversation, {
                            id: (Date.now() + 1).toString(),
                            type: 'ai',
                            content: response.content || '',
                            timestamp: new Date().toLocaleTimeString()
                        }]
                    }));
                } else if (response.tool_call) {
                    const { name, arguments: args } = response.tool_call;
                    const { allowedTools } = get() as AppState;
                    const systemMsg = {
                        id: (Date.now() + 1).toString(),
                        type: 'system' as any,
                        content: `🔧 AI wants to use tool: **${name}**`,
                        timestamp: new Date().toLocaleTimeString()
                    };

                    if (allowedTools.includes(name)) {
                        set((state: AppState) => ({
                            conversation: [...state.conversation, systemMsg],
                            pendingCommand: { id: Date.now().toString(), command: name, args }
                        }));
                        get().executeCommand();
                    } else {
                        set((state: AppState) => ({
                            conversation: [...state.conversation, systemMsg],
                            pendingCommand: { id: Date.now().toString(), command: name, args }
                        }));
                    }
                }
            } catch (error: any) {
                set((state: AppState) => ({
                    conversation: [...state.conversation, {
                        id: (Date.now() + 1).toString(),
                        type: 'system' as any,
                        content: `Error: ${error.message}`,
                        timestamp: new Date().toLocaleTimeString()
                    }]
                }));
            }
        }
    }
}
