import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { EventSource } from "eventsource";

// Polyfill EventSource for Node.js environment
// @ts-ignore
global.EventSource = EventSource;

const MCP_SERVER_URL = "http://127.0.0.1:8000/sse";

export async function callMcpTool(toolName: string, args: any) {
    const transport = new SSEClientTransport(new URL(MCP_SERVER_URL));
    console.log(`Connecting to MCP Server at ${MCP_SERVER_URL}...`);
    const client = new Client({
        name: "travel-app-client",
        version: "1.0.0",
    }, {
        capabilities: {}
    });

    try {
        await client.connect(transport);
        const result = await client.callTool({
            name: toolName,
            arguments: args,
        });
        console.log(`MCP Tool '${toolName}' call successful.`);
        return result;
    } catch (error) {
        console.error(`MCP Tool Call Failed (${toolName}):`, error);
        throw error;
    } finally {
        // Close connection to prevent leaks
        // try-catch in case close fails or validation errors occurred
        try {
            await client.close();
        } catch (e) {
            console.error("Failed to close MCP client:", e);
        }
    }
}
