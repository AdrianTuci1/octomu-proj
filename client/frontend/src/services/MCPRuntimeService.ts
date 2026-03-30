import { ExecuteBinary, ListTools, ExecuteRemoteTool } from '../../bindings/client/app';

export class MCPRuntimeService {
    /**
     * Unified execution logic. Dispatches to local binary or remote HTTP based on metadata.
     */
    static async executeTool(
        mcpId: string,
        toolName: string,
        args: any,
        metadata: {
            type: 'local_binary' | 'remote_http' | string,
            apiKey?: string,
            envVarName?: string,
            endpoint?: string,
            token?: string
        }
    ): Promise<string> {
        if (metadata.type === 'remote_http') {
            return this.executeRemoteTool(mcpId, metadata.endpoint || '', metadata.token || '', toolName, args);
        }

        // Default to local binary
        return this.executeLocalTool(mcpId, toolName, args, metadata.apiKey || '', metadata.envVarName || '');
    }

    /**
     * Executes a tool against a specific LOCAL MCP via the Wails Go side.
     * This actually runs the binary stored in ~/.octomus/bin/{mcpId}
     */
    static async executeLocalTool(mcpId: string, toolName: string, args: any, apiKey: string = '', envVarName: string = ''): Promise<string> {
        console.log(`[MCP Runtime] Executing REAL LOCAL binary for ${toolName} via ${mcpId}...`);

        try {
            // Call the Wails Go binding to execute the binary
            const result = await ExecuteBinary(mcpId, toolName, args, apiKey, envVarName);
            return result;
        } catch (error: any) {
            console.error('[MCP Runtime] Local binary execution failed:', error);
            // Return a more descriptive error message to the AI
            return `Execution failed on client machine: ${error.message || error}`;
        }
    }

    /**
     * Executes a tool against a specific REMOTE MCP via the Wails Go side.
     * This calls the tool over HTTPS (JSON-RPC).
     */
    static async executeRemoteTool(mcpId: string, endpoint: string, token: string, toolName: string, args: any): Promise<string> {
        console.log(`[MCP Runtime] Executing REMOTE tool for ${toolName} via ${mcpId} at ${endpoint}...`);

        try {
            const result = await ExecuteRemoteTool(mcpId, endpoint, token, toolName, args);
            return result;
        } catch (error: any) {
            console.error('[MCP Runtime] Remote execution failed:', error);
            return `Execution failed on remote server: ${error.message || error}`;
        }
    }


    /**
     * Fetches the dynamic list of tools from the locally running MCP binary.
     */
    static async fetchLocalTools(mcpId: string, apiKey: string = '', envVarName: string = ''): Promise<any[]> {
        console.log(`[MCP Runtime] Fetching local tools directly from binary for ${mcpId}...`);
        try {
            const resultStr = await ListTools(mcpId, apiKey, envVarName);
            const data = JSON.parse(resultStr);
            return data.tools || [];
        } catch (error) {
            console.error(`[MCP Runtime] Failed to fetch tools for ${mcpId}:`, error);
            return [];
        }
    }

    /**
     * Fetches the dynamic list of tools from a remote HTTP MCP.
     */
    static async fetchRemoteTools(mcpId: string, endpoint: string, token: string = ''): Promise<any[]> {
        const { MCPService } = await import('./MCPService');
        console.log(`[MCP Runtime] Fetching remote tools from ${endpoint} for ${mcpId}...`);
        try {
            const resultStr = await MCPService.listRemoteTools(mcpId, endpoint, token);
            console.log(`[MCP Runtime] Raw result from ${mcpId}:`, resultStr);
            const data = JSON.parse(resultStr);
            console.log(`[MCP Runtime] Parsed data for ${mcpId}:`, data);

            if (data.tools && Array.isArray(data.tools)) {
                return data.tools;
            }
            if (Array.isArray(data)) {
                return data;
            }
            console.warn(`[MCP Runtime] Could not find tools array in response for ${mcpId}`, data);
            return [];
        } catch (error) {
            console.error(`[MCP Runtime] Failed to fetch remote tools for ${mcpId}:`, error);
            return [];
        }
    }
}
