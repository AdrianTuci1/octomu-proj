import { ExecuteBinary, ListTools } from '../../wailsjs/go/main/App';

export class MCPRuntimeService {
    /**
     * Executes a tool against a specific MCP via the Wails Go side.
     * This actually runs the binary stored in ~/.octomus/bin/{mcpId}
     */
    static async executeTool(mcpId: string, toolName: string, args: any, apiKey: string = '', envVarName: string = ''): Promise<string> {
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
}
