import { StateCreator } from 'zustand';
import { AppState, ExtensionSlice } from '../storeTypes';
import { MCPService } from '../../services/MCPService';
import { MCPRuntimeService } from '../../services/MCPRuntimeService';
import { CheckBinary } from '../../../wailsjs/go/main/App';
import { IMCPRegistryItem } from '../../domain/types';

export const createExtensionSlice: StateCreator<AppState, [], [], ExtensionSlice> = (set, get) => {
    return {
        registry: [],
        tools: {},
        fetchingTools: {},
        toolFetchErrors: {},
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
            const { fetchingTools, registry } = get();

            // Deduplicate: if already fetching, don't start another one
            if (fetchingTools[id]) {
                console.log(`[Extension] Already fetching tools for ${id}, skipping...`);
                return;
            }

            try {
                set(state => ({
                    fetchingTools: { ...state.fetchingTools, [id]: true },
                    toolFetchErrors: { ...state.toolFetchErrors, [id]: null }
                }));

                const extension = registry.find(e => e.id === id);
                let tools: any[] = [];

                if (extension && extension.type === 'local_binary') {
                    console.log(`[Extension] Fetching tools from local binary for ${id}...`);
                    tools = await MCPRuntimeService.fetchLocalTools(
                        id,
                        extension.apiKey || '',
                        extension.auth_config?.env_var_name || ''
                    );
                } else if (extension && extension.type === 'remote_http') {
                    console.log(`[Extension] Fetching tools from remote endpoint for ${id}: ${extension.endpoint}`);
                    tools = await MCPRuntimeService.fetchRemoteTools(id, extension.endpoint || '');
                } else {
                    console.log(`[Extension] Fetching tools from cloud for ${id}...`);
                    const data = await MCPService.fetchTools(id);
                    tools = data.tools;
                }

                if (tools && tools.length > 0) {
                    console.log(`[Extension] Successfully updated tools state for ${id} with ${tools.length} tools`);
                    set(state => ({
                        tools: {
                            ...state.tools,
                            [id]: tools
                        }
                    }));
                } else {
                    console.warn(`[Extension] No tools returned for ${id}`);
                }
            } catch (error: any) {
                console.error(`[Extension] Failed to fetch tools for ${id}:`, error);
                set(state => ({
                    toolFetchErrors: { ...state.toolFetchErrors, [id]: error?.message || String(error) }
                }));
            } finally {
                set(state => ({
                    fetchingTools: { ...state.fetchingTools, [id]: false }
                }));
            }
        },

        connectExtension: async (id: string, apiKey?: string) => {
            const extension = get().registry.find(e => e.id === id);
            if (!extension) return;

            if (extension.type === 'local_binary') {
                set({ registry: get().registry.map(e => e.id === id ? { ...e, status: 'installing' } : e) });
                try {
                    console.log(`[Extension] Starting binary setup for ${id}...`);
                    const exists = await MCPService.checkBinary(id);
                    if (!exists) {
                        await MCPService.downloadBinary(id, extension.download_url || '');
                    }

                    if (apiKey) {
                        console.log(`[Extension] Saving API key for ${id} in Keychain...`);
                        await MCPService.saveCredential(extension.auth_config?.env_var_name || `${id}_apiKey`, apiKey);
                    }

                    set({ registry: get().registry.map(e => e.id === id ? { ...e, status: 'connected', apiKey: apiKey || 'KEYCHAIN_STORED' } : e) });

                    // Auto-fetch tools after successful setup
                    await get().fetchTools(id);
                } catch (error) {
                    console.error(`[Extension] Binary setup failed for ${id}:`, error);
                    set({ registry: get().registry.map(e => e.id === id ? { ...e, status: 'disconnected' } : e) });
                }
            } else if (extension.type === 'remote_http') {
                if (extension.auth_type === 'oauth2' || extension.auth_type === 'oauth') {
                    const grantType = extension.auth_config?.grant_type || 'authorization_code';
                    console.log(`[Extension] Starting ${grantType} flow for ${id}...`);

                    if (grantType === 'client_credentials') {
                        // For client_credentials, apiKey is expected to be "clientId::clientSecret"
                        if (!apiKey || !apiKey.includes('::')) {
                            console.error('[Extension] Invalid credentials format for client_credentials. Expected clientId::clientSecret');
                            return;
                        }
                        const [clientId, clientSecret] = apiKey.split('::');

                        try {
                            set({ registry: get().registry.map(e => e.id === id ? { ...e, status: 'installing' } : e) });
                            const tokenUrl = extension.auth_config?.token_url || '';
                            const scopes = extension.auth_config?.scopes || [];

                            console.log(`[Extension] Exchanging client credentials for ${id} SECURELY via Wails...`);
                            const access_token = await MCPService.exchangeTokenSecurely(
                                id,
                                tokenUrl,
                                clientId,
                                clientSecret,
                                scopes
                            );

                            console.log(`[Extension] Got token for ${id} via Wails.`);
                            // token is already saved to keychain by Wails backend


                            // Set status to connected FIRST so UI is ready to show tools
                            set({ registry: get().registry.map(e => e.id === id ? { ...e, status: 'connected', apiKey: 'KEYCHAIN_STORED' } : e) });

                            console.log(`[Extension] Token saved. Fetching remote tools now...`);
                            await get().fetchTools(id);
                            console.log(`[Extension] Initial tool fetch for ${id} complete.`);
                        } catch (error) {
                            console.error(`[Extension] Client credentials exchange failed for ${id}:`, error);
                            set({ registry: get().registry.map(e => e.id === id ? { ...e, status: 'disconnected' } : e) });
                        }
                        return;
                    }

                    // For authorization_code (browser flow)
                    try {
                        const authUrl = extension.auth_config?.authorization_url || '';
                        if (!authUrl) throw new Error('No authorization URL configured');
                        await MCPService.startOAuthFlow(authUrl);
                        // The callback will be handled by the OS/Wails and eventually call-back into our state
                    } catch (error) {
                        console.error(`[Extension] Failed to start OAuth flow for ${id}:`, error);
                    }
                } else if (extension.auth_type === 'api_key') {
                    // Similar to local binary API key login
                    if (apiKey) {
                        console.log(`[Extension] Saving API key for ${id} in Keychain...`);
                        await MCPService.saveCredential(extension.auth_config?.header_name || `${id}_apiKey`, apiKey);
                        set({ registry: get().registry.map(e => e.id === id ? { ...e, status: 'connected', apiKey: 'KEYCHAIN_STORED' } : e) });
                        await get().fetchTools(id);
                    }
                } else {
                    // No auth
                    set({ registry: get().registry.map(e => e.id === id ? { ...e, status: 'connected' } : e) });
                    await get().fetchTools(id);
                }
            } else {
                // cloud types
                set({ registry: get().registry.map(e => e.id === id ? { ...e, status: 'connected' } : e) });
                await get().fetchTools(id);
            }
        },

        disconnectExtension: async (id: string) => {
            console.log(`[Extension] Disconnecting ${id}...`);

            try {
                const extension = get().registry.find(e => e.id === id);
                if (!extension) return;

                // 1. Update state IMMEDIATELY for UI responsiveness
                set(state => ({
                    registry: state.registry.map(e => e.id === id ? { ...e, status: 'disconnected', apiKey: undefined } : e),
                    tools: { ...state.tools, [id]: [] },
                    toolFetchErrors: { ...state.toolFetchErrors, [id]: null }
                }));

                // 2. Delete credentials from Keychain asynchronously
                if (extension.auth_type === 'api_key') {
                    const key = extension.auth_config?.env_var_name ||
                        extension.auth_config?.header_name ||
                        `${id}_apiKey`;
                    await MCPService.deleteCredential(key);
                } else if (extension.auth_type === 'oauth2' || extension.auth_type === 'oauth') {
                    await MCPService.deleteCredential(`${id}_token`);
                }

                console.log(`[Extension] ${id} disconnected and credentials cleared.`);
            } catch (error) {
                console.error(`[Extension] error during disconnect ${id}:`, error);
            }
        }

    };
};
