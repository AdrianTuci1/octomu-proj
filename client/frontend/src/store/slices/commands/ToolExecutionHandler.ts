import { AppState } from '../../storeTypes';
import { ChatService } from '../../../services/ChatService';
import { MCPRuntimeService } from '../../../services/MCPRuntimeService';
import { ROUTER_TOOLS } from '../../../services/systemTools';
import { IMessage } from '../../../domain/types';

export class ToolExecutionHandler {
    static async execute(set: any, get: any) {
        const { pendingCommand, conversation, registry, tools, sessionArtifacts } = get() as AppState;
        if (!pendingCommand) return;

        const toolName = pendingCommand.command.split(' ')[0];
        const toolArgs = pendingCommand.args || {};
        let content = '';

        // ── Handle Sync & Execute Protocol ──────────────────────────────────────
        if (toolName === 'mcp_sync') {
            const q = (toolArgs.query || '').toLowerCase();
            const connectedMCPs = (registry || []).filter(e => e.status === 'connected');

            const allTools = connectedMCPs.flatMap(e =>
                (tools[e.id] || []).map(t => ({ ...t, mcpId: e.id }))
            );

            const matches = allTools.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q)
            ).slice(0, 15);

            if (matches.length > 0) {
                set((state: AppState) => ({
                    sessionArtifacts: [...state.sessionArtifacts, ...matches]
                }));
                content = `Found matches for "${q}". These tools are now available in your session memory (Artifacts):\n` +
                    matches.map(m => `- **${m.name}** (from ${m.mcpId}): ${m.description}`).join('\n') +
                    ` \n\nYou can now call them using **mcp_execute** with the appropriate arguments.`;
            } else {
                content = `No tools found matching "${q}". Try a different term or list extensions to see available capabilities.`;
            }

            const resultMsg: IMessage = {
                id: Date.now().toString(),
                type: 'tool',
                content,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            const updatedConversation = [...conversation, resultMsg];
            set({ conversation: updatedConversation, pendingCommand: null });

            const finalResponse = await ChatService.proxyChat(updatedConversation, [...ROUTER_TOOLS], connectedMCPs);
            if (finalResponse.content || finalResponse.tool_call) {
                if (finalResponse.content) {
                    set((state: AppState) => ({
                        conversation: [...state.conversation, {
                            id: (Date.now() + 1).toString(),
                            type: 'ai',
                            content: finalResponse.content || '',
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }]
                    }));
                }
                if (finalResponse.tool_call) {
                    set({ pendingCommand: { id: Date.now().toString(), command: finalResponse.tool_call.name, args: finalResponse.tool_call.arguments } });
                    this.execute(set, get);
                }
            }
            return;
        }

        if (toolName === 'mcp_execute') {
            const { mcpId, toolName: targetTool, arguments: args } = toolArgs;
            const mcp = (registry || []).find(e => e.id === mcpId && e.status === 'connected');

            if (!mcp) {
                content = `Error: Extension ${mcpId} is not connected.`;
            } else {
                try {
                    console.log(`[Command] Executing technical tool: ${targetTool} on ${mcpId}`);
                    content = await MCPRuntimeService.executeTool(
                        mcp.id,
                        targetTool,
                        args,
                        {
                            type: mcp.type,
                            apiKey: mcp.apiKey,
                            envVarName: mcp.auth_config?.env_var_name,
                            endpoint: mcp.endpoint
                        }
                    );
                } catch (e: any) {
                    content = `Execution failed: ${e.message}`;
                }
            }

            const resultMsg: IMessage = {
                id: Date.now().toString(),
                type: 'tool',
                content,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            const updatedConversation = [...conversation, resultMsg];
            set({ conversation: updatedConversation, pendingCommand: null });

            const finalResponse = await ChatService.proxyChat(updatedConversation, [...ROUTER_TOOLS], (registry || []).filter(e => e.status === 'connected'));
            if (finalResponse.content) {
                set((state: AppState) => ({
                    conversation: [...state.conversation, {
                        id: (Date.now() + 1).toString(),
                        type: 'ai',
                        content: finalResponse.content || '',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]
                }));
            }
            return;
        }

        // ── Handle Legacy / Direct Tool Calls ───────────────────────────────────
        const connectedMCPs = (registry || []).filter(e => e.status === 'connected');
        let mcp = connectedMCPs.find(e => (tools[e.id] || []).some((t: any) => t.name === toolName));
        if (!mcp) mcp = connectedMCPs[0];

        if (mcp) {
            try {
                const result = await MCPRuntimeService.executeTool(mcp.id, toolName, toolArgs, {
                    type: mcp.type,
                    apiKey: mcp.apiKey,
                    envVarName: mcp.auth_config?.env_var_name,
                    endpoint: mcp.endpoint
                });
                set((state: AppState) => ({
                    conversation: [...state.conversation, { id: Date.now().toString(), type: 'tool', content: result, timestamp: new Date().toLocaleTimeString() }],
                    pendingCommand: null
                }));
            } catch (error: any) {
                set((state: AppState) => ({
                    conversation: [...state.conversation, { id: Date.now().toString(), type: 'system', content: `Execution failed: ${error.message}`, timestamp: new Date().toLocaleTimeString() }],
                    pendingCommand: null
                }));
            }
        }
    }
}
