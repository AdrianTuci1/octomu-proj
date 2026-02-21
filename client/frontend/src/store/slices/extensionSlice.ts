import { StateCreator } from 'zustand';
import { AppState, ExtensionSlice } from '../storeTypes';
import { MCPService } from '../../services/MCPService';
import { MCPRuntimeService } from '../../services/MCPRuntimeService';
import { DownloadBinary, CheckBinary } from '../../../wailsjs/go/main/App';
import * as runtime from '../../../wailsjs/runtime/runtime';
import { IMCPRegistryItem } from '../../domain/types';

export const createExtensionSlice: StateCreator<AppState, [], [], ExtensionSlice> = (set, get) => {
    // Initialize standard listeners once
    runtime.EventsOn('download-progress', (data: { mcpId: string, percentage: number }) => {
        set(state => ({
            installProgress: {
                ...state.installProgress,
                [data.mcpId]: data.percentage
            }
        }));
    });

    return {
        registry: [],
        tools: {},
        installProgress: {},

        fetchRegistry: async () => {
            try {
                const data = await MCPService.fetchRegistry();
                const currentRegistry = get().registry;

                // Merge remote registry with local status/apiKey
                const mergedRegistry = (data?.registry || []).map(remote => {
                    const local = currentRegistry?.find(l => l.id === remote.id);
                    if (local) {
                        return {
                            ...remote,
                            status: local.status,
                            apiKey: local.apiKey
                        };
                    }
                    return remote;
                });

                // Verification pass: check if connected binaries actually exist locally
                const verifiedRegistry = await Promise.all(mergedRegistry.map(async (e) => {
                    if (e.status === 'connected' && e.type === 'local_binary') {
                        const exists = await CheckBinary(e.id);
                        if (!exists) {
                            console.warn(`[Extension] Binary for ${e.id} missing on disk. Reverting to disconnected.`);
                            return { ...e, status: 'disconnected' };
                        }
                    }
                    return e;
                }));

                set({ registry: verifiedRegistry as IMCPRegistryItem[] });
            } catch (error) {
                console.error('Failed to fetch MCP registry:', error);
            }
        },

        fetchTools: async (id: string) => {
            try {
                const extension = get().registry.find(e => e.id === id);
                let tools: any[] = [];

                if (extension && extension.type === 'local_binary') {
                    console.log(`[Extension] Fetching tools from local binary for ${id}...`);
                    tools = await MCPRuntimeService.fetchLocalTools(
                        id,
                        extension.apiKey || '',
                        extension.auth_config?.env_var_name || ''
                    );
                    console.log(`[Extension] Got ${tools.length} tools from binary: ${tools.map((t: any) => t.name).join(', ')}`);
                } else {
                    console.log(`[Extension] Fetching tools from cloud for ${id}...`);
                    const data = await MCPService.fetchTools(id);
                    tools = data.tools;
                    console.log(`[Extension] Got ${tools?.length || 0} cloud tools`);
                }

                if (tools && tools.length > 0) {
                    set(state => ({
                        tools: {
                            ...state.tools,
                            [id]: tools
                        }
                    }));
                } else {
                    console.warn(`[Extension] No tools returned for ${id}, keeping existing state.`);
                }
            } catch (error) {
                console.error(`[Extension] Failed to fetch tools for ${id}:`, error);
            }
        },


        connectExtension: async (id: string, apiKey?: string) => {
            const { registry, fetchTools } = get();
            const extension = registry.find(e => e.id === id);
            if (!extension) {
                console.error(`[Extension] Could not find extension ${id} in registry`);
                return;
            }

            console.log(`[Extension] Connecting ${id}. Type: ${extension.type}, Auth: ${extension.auth_type}`);
            console.log(`[Extension] Download URL: ${extension.download_url || 'N/A'}`);

            if (extension.auth_type === 'oauth' || extension.type === 'cloud') {
                // ... (existing oauth logic)
            } else if (extension.auth_type === 'api_key') {
                if (!apiKey) {
                    console.error('[Extension] API Key required but not provided');
                    return;
                }

                set({
                    registry: get().registry.map(e =>
                        e.id === id ? { ...e, status: 'installing' } : e
                    ),
                    installProgress: { ...get().installProgress, [id]: 0 }
                });

                try {
                    console.log(`[Extension] Starting binary installation for ${id}...`);
                    if (extension.download_url) {
                        console.log(`[Extension] Downloading from: ${extension.download_url}`);
                        await DownloadBinary(id, extension.download_url);
                    } else {
                        console.log(`[Extension] No download URL, falling back to simulation`);
                        await MCPService.installMCP(id);
                    }

                    console.log(`[Extension] Successfully connected ${id}`);
                    set({
                        registry: get().registry.map(e =>
                            e.id === id ? { ...e, status: 'connected', apiKey } : e
                        )
                    });
                    await fetchTools(id);
                } catch (error) {
                    console.error(`[Extension] Installation failed for ${id}:`, error);
                    set({
                        registry: get().registry.map(e =>
                            e.id === id ? { ...e, status: 'disconnected' } : e
                        )
                    });
                }
            } else {
                // Simple install-only MCP or missing binary
                set({
                    registry: registry.map(e =>
                        e.id === id ? { ...e, status: 'installing' } : e
                    ),
                    installProgress: { ...get().installProgress, [id]: 0 }
                });

                try {
                    console.log(`[Extension] Starting installation (no auth) for ${id}...`);
                    if (extension.download_url) {
                        console.log(`[Extension] Downloading from: ${extension.download_url}`);
                        await DownloadBinary(id, extension.download_url);
                    } else {
                        console.log(`[Extension] No download URL, falling back to simulation`);
                        await MCPService.installMCP(id);
                    }
                    set({
                        registry: get().registry.map(e =>
                            e.id === id ? { ...e, status: 'connected' } : e
                        )
                    });
                    await fetchTools(id);
                } catch (error) {
                    console.error(`[Extension] Installation failed for ${id}:`, error);
                    set({
                        registry: get().registry.map(e =>
                            e.id === id ? { ...e, status: 'disconnected' } : e
                        )
                    });
                }
            }
        }
    };
};
