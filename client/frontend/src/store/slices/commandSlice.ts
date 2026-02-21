import { StateCreator } from 'zustand';
import { AppState, CommandSlice } from '../storeTypes';
import { ChatService } from '../../services/ChatService';
import { TerminalService } from '../../services/TerminalService';
import { MCPRuntimeService } from '../../services/MCPRuntimeService';
import { IMessage, IResultItem } from '../../domain/types';
import { DEFAULT_RESULTS } from './resultsData';

export const createCommandSlice: StateCreator<AppState, [], [], CommandSlice> = (set, get) => ({
    results: DEFAULT_RESULTS,
    extensions: [
        {
            id: 'ext-llm',
            label: 'Octomus LLM',
            handle: 'ai',
            description: 'Powerful general purpose AI',
            icon: 'Sparkles',
            type: 'ai_tool'
        },
        {
            id: 'ext-img',
            label: 'Image Generation',
            handle: 'image',
            description: 'Generate stunning visuals',
            icon: 'Image',
            type: 'ai_tool'
        },
        {
            id: 'ext-photo',
            label: 'Photo Analysis',
            handle: 'photo',
            description: 'Analyze and describe images',
            icon: 'Camera',
            type: 'ai_tool'
        },
        {
            id: 'ext-slack',
            label: 'Slack',
            handle: 'slack',
            description: 'Search workspace messages',
            icon: 'Hash',
            type: 'app_connector'
        }
    ] as any,
    allowedTools: [],
    pendingCommand: null,

    setPendingCommand: (command) => set({ pendingCommand: command }),

    allowTool: (name) => set(state => ({
        allowedTools: [...state.allowedTools, name]
    })),

    executeCommand: async () => {
        const { pendingCommand, conversation, registry, tools } = get();
        if (!pendingCommand) return;

        const toolName = pendingCommand.command.split(' ')[0];
        const toolArgs = pendingCommand.args || {};

        // Find the specific MCP that owns this tool
        const connectedMCPs = (registry || []).filter(e => e.status === 'connected');
        let mcp = connectedMCPs.find(e =>
            (tools[e.id] || []).some((t: any) => t.name === toolName)
        );
        // Fallback: use first connected MCP if we can't find specific owner
        if (!mcp) mcp = connectedMCPs[0];

        if (!mcp) {
            console.error('[Command] No connected MCP found to execute tool:', toolName);
            set(state => ({
                conversation: [...state.conversation, {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `Error: No connected MCP found to execute ${toolName}. Please connect an MCP first.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]
            }));
            return;
        }

        const apiKey = mcp.apiKey || '';
        const envVarName = mcp.auth_config?.env_var_name || '';

        try {
            console.log(`[Command] Executing tool: ${toolName} on ${mcp.id}. EnvVar: ${envVarName || 'Auto'}`);
            const result = await MCPRuntimeService.executeTool(
                mcp.id,
                toolName,
                toolArgs,
                apiKey,
                envVarName
            );

            const resultMsg: IMessage = {
                id: Date.now().toString(),
                type: 'tool',
                content: result,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            const updatedConversation = [...conversation, resultMsg];

            set({
                conversation: updatedConversation,
                pendingCommand: null,
                currentView: 'main'
            });

            // Trigger AI follow-up with the actual result — also pass tools so AI can chain more calls
            const currentTools = (registry || [])
                .filter(e => e.status === 'connected')
                .flatMap((e: any) => get().tools[e.id] || []);

            const finalResponse = await ChatService.proxyChat(updatedConversation, currentTools.length > 0 ? currentTools : undefined);
            if (finalResponse.content) {
                const aiMsg: IMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'ai',
                    content: finalResponse.content,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                set(state => ({ conversation: [...state.conversation, aiMsg] }));
            }
        } catch (error: any) {
            console.error('Execution failed:', error);
            set(state => ({
                conversation: [...state.conversation, {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `Execution failed: ${error.message}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]
            }));
        }
    },

    rejectCommand: () => set({ pendingCommand: null }),

    handleResultSelection: (item) => {
        if (item.id === 'mcp-marketplace') {
            set({
                currentView: 'authorizations',
                query: '',
                typingQuery: '',
                suggestion: '',
                selectedIndex: 0
            });
            get().fetchRegistry();
            return;
        }

        if (item.command) {
            set({
                pendingCommand: { id: Date.now().toString(), command: item.command },
                query: '',
                typingQuery: '',
                suggestion: ''
            });
        } else if (item.type === 'ai_extension' && item.mention) {
            set({
                isChatMode: true,
                currentView: 'main',
                query: item.mention + ' ',
                typingQuery: item.mention + ' '
            });
        }
    },

    handleChatSubmit: async () => {
        const { query, typingQuery, isChatMode, selectedIndex, results, chatSessions, currentView, showMentions, extensions, addMention, registry } = get();

        if (showMentions && selectedIndex >= 0) {
            const lastWord = typingQuery.split(' ').pop() || '';
            const filter = lastWord.startsWith('@') ? lastWord.slice(1).toLowerCase() : '';
            const filteredExts = extensions.filter(ex =>
                ex.label.toLowerCase().includes(filter) ||
                ex.handle.toLowerCase().includes(filter)
            );
            const selected = filteredExts[selectedIndex];
            if (selected) {
                addMention(selected);
                return;
            }
        }

        // Handle Enter in the Marketplace view — open the focused card's detail
        if (currentView === 'authorizations') {
            const focusedItem = registry[selectedIndex];
            if (focusedItem) {
                set({
                    selectedIntegrationId: focusedItem.id,
                    currentView: 'mcpDetail',
                    selectedIndex: 0
                });
            }
            return;
        }

        if (!isChatMode && currentView === 'chatHistory') {
            const filteredResults = typingQuery.trim() === ''
                ? results
                : results.filter(r =>
                    r.label.toLowerCase().includes(typingQuery.toLowerCase()) ||
                    r.category.toLowerCase().includes(typingQuery.toLowerCase())
                );

            const selected = filteredResults[selectedIndex];
            if (selected) {
                get().handleResultSelection(selected);
                return;
            } else if (typingQuery.trim() === '' && selectedIndex >= filteredResults.length) {
                const historyIdx = selectedIndex - filteredResults.length;
                const selectedSession = chatSessions[historyIdx];
                if (selectedSession) {
                    set({ currentView: 'main', isChatMode: true });
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

        const shouldChat = isChatMode || (!cmd && query.trim().length > 0);

        if (shouldChat) {
            const userMsg = ChatService.createUserMessage(query);
            const currentConversation = [...get().conversation, userMsg];

            set({
                conversation: currentConversation,
                query: '',
                typingQuery: '',
                currentView: 'main',
                isChatMode: true
            });

            // Always fetch fresh tools from local binaries before asking the LLM
            const { registry, fetchTools } = get();
            const connectedMCPs = (registry || []).filter(e => e.status === 'connected');

            await Promise.all(connectedMCPs.map(e => fetchTools(e.id)));

            const freshTools = connectedMCPs.flatMap(e => get().tools[e.id] || []);

            console.log('[Command] Fresh tools being sent to LLM:', freshTools.map((t: any) => t.name));

            try {
                const response = await ChatService.proxyChat(
                    currentConversation,
                    freshTools.length > 0 ? freshTools : undefined
                );

                console.log('[Command] Got LLM response:', response);

                if (response.content) {
                    const aiMsg = {
                        id: (Date.now() + 1).toString(),
                        type: 'ai' as any,
                        content: response.content,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    set(state => ({ conversation: [...state.conversation, aiMsg] }));
                } else if (response.tool_call) {
                    const { name, arguments: args } = response.tool_call;
                    const { allowedTools } = get();

                    const systemMsg = {
                        id: (Date.now() + 1).toString(),
                        type: 'system' as any,
                        content: `🔧 AI wants to use tool: **${name}**`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };

                    if (allowedTools.includes(name)) {
                        set(state => ({ conversation: [...state.conversation, systemMsg] }));
                        set({ pendingCommand: { id: Date.now().toString(), command: name, args } });
                        get().executeCommand();
                    } else {
                        set(state => ({
                            conversation: [...state.conversation, systemMsg],
                            pendingCommand: { id: Date.now().toString(), command: name, args }
                        }));
                    }
                } else {
                    console.warn('[Command] LLM response had neither content nor tool_call:', response);
                }
            } catch (error: any) {
                console.error('[Command] Chat proxy failed:', error);
                set(state => ({
                    conversation: [...state.conversation, {
                        id: (Date.now() + 1).toString(),
                        type: 'system' as any,
                        content: `Error: ${error.message}`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]
                }));
            }
        }
    }
});
