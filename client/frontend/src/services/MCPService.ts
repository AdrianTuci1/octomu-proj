import { ApiService } from './ApiService';
import { IMCPRegistryItem } from '../domain/types';

export interface IMCPToolsResponse {
    mcp_id: string;
    tools: any[];
}

export interface IAuthStartResponse {
    provider: string;
    auth_url: string;
}

export class MCPService extends ApiService {
    static async fetchRegistry(): Promise<{ registry: IMCPRegistryItem[] }> {
        return this.get<{ registry: IMCPRegistryItem[] }>('/v1/mcp/directory');
    }

    static async fetchTools(id: string): Promise<IMCPToolsResponse> {
        return this.get<IMCPToolsResponse>(`/v1/mcp/inspect/${id}`);
    }

    static async startAuth(id: string): Promise<IAuthStartResponse> {
        return this.get<IAuthStartResponse>(`/v1/auth/start/${id}`);
    }

    static async installMCP(id: string): Promise<{ message: string; status: string }> {
        return this.post<{ message: string; status: string }>(`/v1/mcp/install/${id}`, {});
    }
}
