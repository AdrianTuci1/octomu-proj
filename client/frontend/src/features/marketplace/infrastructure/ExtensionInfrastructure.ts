import { MCPService } from '../../../services/MCPService';
import { MCPRuntimeService } from '../../../services/MCPRuntimeService';
import { CheckBinary, StopBinary } from '../../../../bindings/client/app';
import { IMCPRegistryItem } from '../../../domain/types';

export interface IExtensionInfrastructure {
    fetchRegistry(): Promise<any>;
    checkBinaryExists(id: string): Promise<boolean>;
    fetchTools(extension: IMCPRegistryItem): Promise<any[]>;
    installBinary(id: string, url: string): Promise<void>;
    saveCredential(key: string, value: string): Promise<void>;
    deleteCredential(key: string): Promise<void>;
    stopProcess(id: string): Promise<void>;
    startOAuthFlow(url: string): Promise<void>;
    exchangeToken(id: string, url: string, clientId: string, clientSecret: string, scopes: string[]): Promise<string>;
}

export class ExtensionInfrastructure implements IExtensionInfrastructure {
    async fetchRegistry() {
        return await MCPService.fetchRegistry();
    }

    async checkBinaryExists(id: string) {
        return await CheckBinary(id);
    }

    async fetchTools(extension: IMCPRegistryItem) {
        if (extension.type === 'local_binary') {
            return await MCPRuntimeService.fetchLocalTools(
                extension.id,
                extension.apiKey || '',
                extension.auth_config?.env_var_name || ''
            );
        } else if (extension.type === 'remote_http') {
            return await MCPRuntimeService.fetchRemoteTools(extension.id, extension.endpoint || '');
        } else {
            const data = await MCPService.fetchTools(extension.id);
            return data.tools;
        }
    }

    async installBinary(id: string, url: string) {
        const exists = await MCPService.checkBinary(id);
        if (!exists) {
            await MCPService.downloadBinary(id, url);
        }
    }

    async saveCredential(key: string, value: string) {
        await MCPService.saveCredential(key, value);
    }

    async deleteCredential(key: string) {
        await MCPService.deleteCredential(key);
    }

    async stopProcess(id: string) {
        await StopBinary(id);
    }

    async startOAuthFlow(url: string) {
        await MCPService.startOAuthFlow(url);
    }

    async exchangeToken(id: string, url: string, clientId: string, clientSecret: string, scopes: string[]) {
        return await MCPService.exchangeTokenSecurely(id, url, clientId, clientSecret, scopes);
    }
}
