import { StateCreator } from 'zustand';
import { AppState, ExtensionSlice } from '../storeTypes';
import { IMCPRegistryItem } from '../../domain/types';

export const createExtensionSlice: StateCreator<AppState, [], [], ExtensionSlice> = (set, get) => ({
    registry: [],
    tools: {},

    fetchRegistry: async () => {
        try {
            const response = await fetch('http://localhost:8080/v1/mcp/directory');
            const data = await response.json();

            set({ registry: data.registry });
        } catch (error) {
            console.error('Failed to fetch MCP registry:', error);
        }
    },

    fetchTools: async (id: string) => {
        try {
            const response = await fetch(`http://localhost:8080/v1/mcp/inspect/${id}`);
            const data = await response.json();

            set(state => ({
                tools: {
                    ...state.tools,
                    [id]: data.tools
                }
            }));
        } catch (error) {
            console.error(`Failed to fetch tools for ${id}:`, error);
        }
    },

    connectExtension: async (id: string) => {
        const { registry, fetchTools } = get();
        const extension = registry.find(e => e.id === id);
        if (!extension) return;

        console.log(`Connecting extension: ${id}`);

        // 1. If it's a cloud app or local binary needing OAuth, start Auth flow
        if (extension.type === 'cloud' || id === 'exa_search') {
            try {
                const response = await fetch(`http://localhost:8080/v1/auth/start/${id}`);
                const data = await response.json();

                if (data.auth_url) {
                    window.open(data.auth_url, '_blank');

                    // Simulate OAuth success callback
                    setTimeout(async () => {
                        // 2. Start Background Install if it's a binary
                        if (extension.type === 'local_binary') {
                            set({
                                registry: get().registry.map(e =>
                                    e.id === id ? { ...e, status: 'installing' } : e
                                )
                            });
                            // Wait for "install"
                            await new Promise(r => setTimeout(r, 2000));
                        }

                        set({
                            registry: get().registry.map(e =>
                                e.id === id ? { ...e, status: 'connected' } : e
                            )
                        });
                        await fetchTools(id);
                    }, 3000);
                }
            } catch (error) {
                console.error(`Connection failed for ${id}:`, error);
            }
        } else {
            // 3. For public tools (everything, memory), just install & connect
            set({
                registry: registry.map(e =>
                    e.id === id ? { ...e, status: 'installing' } : e
                )
            });

            setTimeout(async () => {
                set({
                    registry: get().registry.map(e =>
                        e.id === id ? { ...e, status: 'connected' } : e
                    )
                });
                await fetchTools(id);
            }, 1500);
        }
    }
});
