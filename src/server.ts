#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ValueSerpClient } from './client.js';
import { registerSearchTools } from './tools.js';

export class ValueSerpMcpServer {
  private server: McpServer;
  private client: ValueSerpClient;

  constructor() {
    const apiKey = process.env.VALUESERP_API_KEY;
    if (!apiKey) {
      throw new Error('VALUESERP_API_KEY environment variable is required');
    }

    this.client = new ValueSerpClient({ apiKey });

    this.server = new McpServer({
      name: 'valueserp-mcp-server',
      version: '1.0.0',
      capabilities: {
        tools: {},
        logging: {}
      }
    });

    this.setupTools();
  }

  private setupTools() {
    registerSearchTools(this.server, this.client);
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ValueSerp MCP Server running on stdio');
  }
}

export async function main() {
  try {
    const server = new ValueSerpMcpServer();
    await server.start();
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}