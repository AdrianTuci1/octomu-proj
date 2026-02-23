import { IMCPRegistryItem, IMCPTool } from '../../../domain/types';
import { AppState } from '../../../store/storeTypes';
import { IExtensionInfrastructure } from '../infrastructure/ExtensionInfrastructure';

export interface IExtensionStore {
    getState(): AppState;
    setState(state: Partial<AppState> | ((state: AppState) => Partial<AppState>)): void;
}

export class ExtensionManager {
    constructor(
        private infrastructure: IExtensionInfrastructure,
        private store: IExtensionStore
    ) { }

    private setMarketplaceState(changes: Partial<AppState['marketplace']>) {
        this.store.setState(state => ({
            marketplace: { ...state.marketplace, ...changes }
        }));
    }

    async initialize() {
        try {
            const data = await this.infrastructure.fetchRegistry();
            const { registry } = this.store.getState().marketplace;

            const mergedRegistry = (data?.registry || []).map((remote: any) => {
                const local = registry?.find(l => l.id === remote.id);
                if (local) {
                    return {
                        ...remote,
                        status: local.status,
                        apiKey: local.apiKey,
                        isEnabled: local.isEnabled !== undefined ? local.isEnabled : true
                    };
                }
                return remote;
            });

            const verifiedRegistry = await Promise.all(mergedRegistry.map(async (e: IMCPRegistryItem) => {
                if (e.status === 'connected' && e.type === 'local_binary') {
                    const exists = await this.infrastructure.checkBinaryExists(e.id);
                    if (!exists) return { ...e, status: 'disconnected' };
                }
                return e;
            }));

            this.setMarketplaceState({ registry: verifiedRegistry as IMCPRegistryItem[] });
        } catch (error) {
            console.error('[ExtensionManager] Failed to initialize:', error);
        }
    }

    async fetchTools(id: string) {
        const { registry, fetchingTools, toolErrors } = this.store.getState().marketplace;
        const extension = registry.find(e => e.id === id);
        if (!extension) return;

        try {
            this.setMarketplaceState({
                fetchingTools: { ...fetchingTools, [id]: true },
                toolErrors: { ...toolErrors, [id]: null }
            });

            const tools = await this.infrastructure.fetchTools(extension);

            const state = this.store.getState().marketplace;
            this.setMarketplaceState({
                tools: { ...state.tools, [id]: tools }
            });
        } catch (error: any) {
            console.error(`[ExtensionManager] Failed to fetch tools for ${id}:`, error);
            const state = this.store.getState().marketplace;
            this.setMarketplaceState({
                toolErrors: { ...state.toolErrors, [id]: error?.message || String(error) }
            });
        } finally {
            const state = this.store.getState().marketplace;
            this.setMarketplaceState({
                fetchingTools: { ...state.fetchingTools, [id]: false }
            });
        }
    }

    async connect(id: string, apiKey?: string) {
        const { registry } = this.store.getState().marketplace;
        const extension = registry.find(e => e.id === id);
        if (!extension) return;

        try {
            this.updateStatus(id, 'installing');

            if (extension.type === 'local_binary') {
                await this.infrastructure.installBinary(id, extension.download_url || '');
                if (apiKey) {
                    await this.infrastructure.saveCredential(extension.auth_config?.env_var_name || `${id}_apiKey`, apiKey);
                }
                this.updateStatus(id, 'connected', {
                    apiKey: apiKey || 'KEYCHAIN_STORED',
                    isEnabled: true
                });
                await this.fetchTools(id);
            } else if (extension.type === 'remote_http') {
                await this.handleRemoteConnection(extension, apiKey);
            } else {
                this.updateStatus(id, 'connected');
                await this.fetchTools(id);
            }
        } catch (error) {
            console.error(`[ExtensionManager] Connection failed for ${id}:`, error);
            this.updateStatus(id, 'disconnected');
        }
    }

    private updateStatus(id: string, status: IMCPRegistryItem['status'], extra?: Partial<IMCPRegistryItem>) {
        const { registry } = this.store.getState().marketplace;
        this.setMarketplaceState({
            registry: registry.map(e => e.id === id ? { ...e, status, ...extra } : e)
        });
    }

    private async handleRemoteConnection(extension: IMCPRegistryItem, apiKey?: string) {
        const id = extension.id;
        if (extension.auth_type === 'oauth2' || extension.auth_type === 'oauth') {
            const grantType = extension.auth_config?.grant_type || 'authorization_code';
            if (grantType === 'client_credentials') {
                if (!apiKey || !apiKey.includes('::')) throw new Error('Invalid credentials format');
                const [clientId, clientSecret] = apiKey.split('::');
                await this.infrastructure.exchangeToken(
                    id,
                    extension.auth_config?.token_url || '',
                    clientId,
                    clientSecret,
                    extension.auth_config?.scopes || []
                );
                this.updateStatus(id, 'connected', { apiKey: 'KEYCHAIN_STORED' });
                await this.fetchTools(id);
            } else {
                await this.infrastructure.startOAuthFlow(extension.auth_config?.authorization_url || '');
            }
        } else if (extension.auth_type === 'api_key') {
            if (apiKey) {
                await this.infrastructure.saveCredential(extension.auth_config?.header_name || `${id}_apiKey`, apiKey);
                this.updateStatus(id, 'connected', { apiKey: 'KEYCHAIN_STORED' });
                await this.fetchTools(id);
            }
        } else {
            this.updateStatus(id, 'connected');
            await this.fetchTools(id);
        }
    }

    async disconnect(id: string) {
        try {
            const { registry, tools } = this.store.getState().marketplace;
            const extension = registry.find(e => e.id === id);
            if (!extension) return;

            this.updateStatus(id, 'disconnected', { apiKey: undefined });

            const newTools = { ...tools };
            delete newTools[id];
            this.setMarketplaceState({ tools: newTools });

            if (extension.auth_type === 'api_key') {
                const key = extension.auth_config?.env_var_name || extension.auth_config?.header_name || `${id}_apiKey`;
                await this.infrastructure.deleteCredential(key);
            } else if (extension.auth_type === 'oauth2' || extension.auth_type === 'oauth') {
                await this.infrastructure.deleteCredential(`${id}_token`);
            }
        } catch (error) {
            console.error(`[ExtensionManager] Disconnect failed for ${id}:`, error);
        }
    }

    async toggle(id: string) {
        const { registry } = this.store.getState().marketplace;
        const extension = registry.find(e => e.id === id);
        if (!extension || extension.status !== 'connected') return;

        const newEnabledState = !extension.isEnabled;
        try {
            if (!newEnabledState) {
                await this.infrastructure.stopProcess(id);
                const { tools } = this.store.getState().marketplace;
                const newTools = { ...tools };
                delete newTools[id];
                this.setMarketplaceState({ tools: newTools });
            }
            this.updateStatus(id, extension.status, { isEnabled: newEnabledState });
            if (newEnabledState) {
                await this.fetchTools(id);
            }
        } catch (error) {
            console.error(`[ExtensionManager] Toggle failed for ${id}:`, error);
        }
    }
}
