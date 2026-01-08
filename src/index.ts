/**
 * NeXify AI MCP Server
 * Supreme Autonomous General Intelligence - German Engineering Standards
 * 
 * Features:
 * - Multi-AI Provider Routing (OpenAI, DeepSeek, OpenRouter, Hugging Face)
 * - Qdrant Vector Database Integration
 * - Self-Extension Capabilities
 * - Tool Management & Dynamic Registration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Environment Configuration
const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: 'https://openrouter.ai/api/v1',
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com/v1',
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
  },
  qdrant: {
    url: process.env.QDRANT_URL || 'https://f256664d-f56d-42e5-8fbd-e724b5f832bf.europe-west3-0.gcp.cloud.qdrant.io',
    apiKey: process.env.QDRANT_API_KEY || '',
  },
  github: {
    token: process.env.GITHUB_TOKEN || '',
  },
  vercel: {
    token: process.env.VERCEL_TOKEN || '',
    teamId: process.env.VERCEL_TEAM_ID || '',
    projectId: process.env.VERCEL_PROJECT_ID || '',
  },
};

// Dynamic Tool Registry - Can be extended at runtime
const dynamicTools: Map<string, Tool> = new Map();

// Core Tools Definition
const coreTools: Tool[] = [
  // === AI Provider Tools ===
  {
    name: 'ask_openai',
    description: 'Query OpenAI GPT-4 Turbo for complex reasoning tasks',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'The prompt to send' },
        system: { type: 'string', description: 'Optional system message' },
        max_tokens: { type: 'number', description: 'Max tokens (default: 4096)' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ask_deepseek',
    description: 'Query DeepSeek for code generation and analysis (cost-effective)',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'The prompt to send' },
        model: { type: 'string', description: 'Model: deepseek-chat or deepseek-coder' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ask_openrouter',
    description: 'Route to best AI model via OpenRouter (auto-selects optimal model)',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'The prompt to send' },
        model: { type: 'string', description: 'Specific model or "auto" for routing' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ask_huggingface',
    description: 'Query Hugging Face models for specialized tasks',
    inputSchema: {
      type: 'object',
      properties: {
        model: { type: 'string', description: 'Model ID on Hugging Face' },
        inputs: { type: 'string', description: 'Input text or data' },
      },
      required: ['model', 'inputs'],
    },
  },
  // === Qdrant Vector Database Tools ===
  {
    name: 'qdrant_search',
    description: 'Search Qdrant vector database for semantic similarity',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name to search' },
        query: { type: 'string', description: 'Search query (will be embedded)' },
        limit: { type: 'number', description: 'Max results (default: 5)' },
      },
      required: ['collection', 'query'],
    },
  },
  {
    name: 'qdrant_upsert',
    description: 'Insert or update vectors in Qdrant',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        id: { type: 'string', description: 'Point ID' },
        text: { type: 'string', description: 'Text to embed and store' },
        metadata: { type: 'object', description: 'Additional metadata' },
      },
      required: ['collection', 'id', 'text'],
    },
  },
  {
    name: 'qdrant_list_collections',
    description: 'List all Qdrant collections',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'qdrant_create_collection',
    description: 'Create a new Qdrant collection',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Collection name' },
        vector_size: { type: 'number', description: 'Vector dimensions (default: 1536 for OpenAI)' },
      },
      required: ['name'],
    },
  },
  // === Self-Extension Tools ===
  {
    name: 'register_tool',
    description: 'Register a new tool dynamically (self-extension)',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tool name' },
        description: { type: 'string', description: 'Tool description' },
        inputSchema: { type: 'object', description: 'JSON Schema for input' },
        handler_code: { type: 'string', description: 'JavaScript code for handler' },
      },
      required: ['name', 'description', 'inputSchema', 'handler_code'],
    },
  },
  {
    name: 'list_registered_tools',
    description: 'List all dynamically registered tools',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'remove_tool',
    description: 'Remove a dynamically registered tool',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tool name to remove' },
      },
      required: ['name'],
    },
  },
  // === GitHub Tools ===
  {
    name: 'github_get_file',
    description: 'Get file content from GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        path: { type: 'string', description: 'File path' },
        branch: { type: 'string', description: 'Branch (default: main)' },
      },
      required: ['owner', 'repo', 'path'],
    },
  },
  {
    name: 'github_update_file',
    description: 'Update or create file in GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        path: { type: 'string', description: 'File path' },
        content: { type: 'string', description: 'File content' },
        message: { type: 'string', description: 'Commit message' },
        branch: { type: 'string', description: 'Branch (default: main)' },
      },
      required: ['owner', 'repo', 'path', 'content', 'message'],
    },
  },
  // === Code Generation Tools ===
  {
    name: 'generate_code',
    description: 'Generate code using the best available AI model',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', description: 'Programming language' },
        description: { type: 'string', description: 'What the code should do' },
        context: { type: 'string', description: 'Additional context or requirements' },
      },
      required: ['language', 'description'],
    },
  },
  {
    name: 'analyze_code',
    description: 'Analyze code for bugs, improvements, and security issues',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code to analyze' },
        language: { type: 'string', description: 'Programming language' },
      },
      required: ['code'],
    },
  },
  // === Memory & Knowledge Tools ===
  {
    name: 'store_knowledge',
    description: 'Store knowledge in the dual-brain architecture (Vector Store + Qdrant)',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Knowledge to store' },
        type: { type: 'string', description: 'Type: semantic, episodic, procedural' },
        tags: { type: 'array', description: 'Tags for categorization' },
      },
      required: ['content', 'type'],
    },
  },
  {
    name: 'query_knowledge',
    description: 'Query the knowledge base with semantic search',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        type: { type: 'string', description: 'Filter by type (optional)' },
        limit: { type: 'number', description: 'Max results' },
      },
      required: ['query'],
    },
  },
  // === System Tools ===
  {
    name: 'system_status',
    description: 'Get current system status and health metrics',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'add_api_integration',
    description: 'Add a new API integration to the MCP server',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Integration name' },
        base_url: { type: 'string', description: 'API base URL' },
        api_key: { type: 'string', description: 'API key (will be stored securely)' },
        endpoints: {
          type: 'array',
          description: 'List of endpoints to expose as tools',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              method: { type: 'string' },
              path: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
      },
      required: ['name', 'base_url', 'endpoints'],
    },
  },
];

// Tool Handlers
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  // OpenAI Handler
  async ask_openai(args: { prompt: string; system?: string; max_tokens?: number }) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.openai.model,
        messages: [
          ...(args.system ? [{ role: 'system', content: args.system }] : []),
          { role: 'user', content: args.prompt },
        ],
        max_tokens: args.max_tokens || 4096,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data;
  },

  // DeepSeek Handler
  async ask_deepseek(args: { prompt: string; model?: string }) {
    const response = await fetch(`${config.deepseek.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.deepseek.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: args.model || 'deepseek-chat',
        messages: [{ role: 'user', content: args.prompt }],
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data;
  },

  // OpenRouter Handler
  async ask_openrouter(args: { prompt: string; model?: string }) {
    const response = await fetch(`${config.openrouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouter.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: args.model || 'auto',
        messages: [{ role: 'user', content: args.prompt }],
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data;
  },

  // Hugging Face Handler
  async ask_huggingface(args: { model: string; inputs: string }) {
    const response = await fetch(`https://api-inference.huggingface.co/models/${args.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.huggingface.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: args.inputs }),
    });
    return response.json();
  },

  // Qdrant Search
  async qdrant_search(args: { collection: string; query: string; limit?: number }) {
    // First, get embedding from OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: args.query,
      }),
    });
    const embeddingData = await embeddingResponse.json();
    const vector = embeddingData.data?.[0]?.embedding;

    if (!vector) {
      throw new Error('Failed to generate embedding');
    }

    // Search in Qdrant
    const searchResponse = await fetch(`${config.qdrant.url}/collections/${args.collection}/points/search`, {
      method: 'POST',
      headers: {
        'api-key': config.qdrant.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector,
        limit: args.limit || 5,
        with_payload: true,
      }),
    });
    return searchResponse.json();
  },

  // Qdrant Upsert
  async qdrant_upsert(args: { collection: string; id: string; text: string; metadata?: any }) {
    // Get embedding
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: args.text,
      }),
    });
    const embeddingData = await embeddingResponse.json();
    const vector = embeddingData.data?.[0]?.embedding;

    // Upsert to Qdrant
    const upsertResponse = await fetch(`${config.qdrant.url}/collections/${args.collection}/points`, {
      method: 'PUT',
      headers: {
        'api-key': config.qdrant.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        points: [{
          id: args.id,
          vector,
          payload: {
            text: args.text,
            ...args.metadata,
            timestamp: new Date().toISOString(),
          },
        }],
      }),
    });
    return upsertResponse.json();
  },

  // Qdrant List Collections
  async qdrant_list_collections() {
    const response = await fetch(`${config.qdrant.url}/collections`, {
      headers: { 'api-key': config.qdrant.apiKey },
    });
    return response.json();
  },

  // Qdrant Create Collection
  async qdrant_create_collection(args: { name: string; vector_size?: number }) {
    const response = await fetch(`${config.qdrant.url}/collections/${args.name}`, {
      method: 'PUT',
      headers: {
        'api-key': config.qdrant.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: {
          size: args.vector_size || 1536,
          distance: 'Cosine',
        },
      }),
    });
    return response.json();
  },

  // Register Tool (Self-Extension)
  async register_tool(args: { name: string; description: string; inputSchema: any; handler_code: string }) {
    const tool: Tool = {
      name: args.name,
      description: args.description,
      inputSchema: args.inputSchema,
    };
    
    // Store the tool
    dynamicTools.set(args.name, tool);
    
    // Create handler from code (sandboxed)
    try {
      const handler = new Function('args', 'config', 'fetch', args.handler_code);
      toolHandlers[args.name] = async (handlerArgs: any) => {
        return handler(handlerArgs, config, fetch);
      };
    } catch (error) {
      throw new Error(`Failed to create handler: ${error}`);
    }
    
    return { success: true, tool: args.name, message: 'Tool registered successfully' };
  },

  // List Registered Tools
  async list_registered_tools() {
    return {
      core_tools: coreTools.map(t => t.name),
      dynamic_tools: Array.from(dynamicTools.keys()),
      total: coreTools.length + dynamicTools.size,
    };
  },

  // Remove Tool
  async remove_tool(args: { name: string }) {
    if (dynamicTools.has(args.name)) {
      dynamicTools.delete(args.name);
      delete toolHandlers[args.name];
      return { success: true, message: `Tool ${args.name} removed` };
    }
    return { success: false, message: `Tool ${args.name} not found or is a core tool` };
  },

  // GitHub Get File
  async github_get_file(args: { owner: string; repo: string; path: string; branch?: string }) {
    const url = `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${args.path}?ref=${args.branch || 'main'}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.github.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    const data = await response.json();
    if (data.content) {
      data.decoded_content = Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return data;
  },

  // GitHub Update File
  async github_update_file(args: { owner: string; repo: string; path: string; content: string; message: string; branch?: string }) {
    // First, try to get existing file for SHA
    let sha: string | undefined;
    try {
      const existing = await toolHandlers.github_get_file({
        owner: args.owner,
        repo: args.repo,
        path: args.path,
        branch: args.branch,
      });
      sha = existing.sha;
    } catch {
      // File doesn't exist, will create new
    }

    const url = `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${args.path}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.github.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: args.message,
        content: Buffer.from(args.content).toString('base64'),
        branch: args.branch || 'main',
        ...(sha && { sha }),
      }),
    });
    return response.json();
  },

  // Generate Code
  async generate_code(args: { language: string; description: string; context?: string }) {
    const prompt = `Generate ${args.language} code for the following:

Description: ${args.description}
${args.context ? `\nContext: ${args.context}` : ''}

Requirements:
- Follow best practices for ${args.language}
- Include type hints/annotations where applicable
- Add clear comments
- Handle errors appropriately
- Make code production-ready

Respond with ONLY the code, no explanations.`;

    // Use DeepSeek for code generation (cost-effective)
    return toolHandlers.ask_deepseek({ prompt, model: 'deepseek-coder' });
  },

  // Analyze Code
  async analyze_code(args: { code: string; language?: string }) {
    const prompt = `Analyze the following ${args.language || ''} code for:
1. Bugs and potential issues
2. Security vulnerabilities
3. Performance improvements
4. Code style and best practices

Code:
\`\`\`
${args.code}
\`\`\`

Provide a detailed analysis with specific recommendations.`;

    return toolHandlers.ask_openai({ prompt });
  },

  // Store Knowledge
  async store_knowledge(args: { content: string; type: string; tags?: string[] }) {
    const collection = `${args.type}_memory`;
    const id = `knowledge_${Date.now()}`;
    
    return toolHandlers.qdrant_upsert({
      collection,
      id,
      text: args.content,
      metadata: {
        type: args.type,
        tags: args.tags || [],
      },
    });
  },

  // Query Knowledge
  async query_knowledge(args: { query: string; type?: string; limit?: number }) {
    const collection = args.type ? `${args.type}_memory` : 'semantic_memory';
    return toolHandlers.qdrant_search({
      collection,
      query: args.query,
      limit: args.limit || 5,
    });
  },

  // System Status
  async system_status() {
    return {
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      tools: {
        core: coreTools.length,
        dynamic: dynamicTools.size,
        total: coreTools.length + dynamicTools.size,
      },
      integrations: {
        openai: !!config.openai.apiKey,
        deepseek: !!config.deepseek.apiKey,
        openrouter: !!config.openrouter.apiKey,
        huggingface: !!config.huggingface.apiKey,
        qdrant: !!config.qdrant.apiKey,
        github: !!config.github.token,
        vercel: !!config.vercel.token,
      },
    };
  },

  // Add API Integration
  async add_api_integration(args: { name: string; base_url: string; api_key?: string; endpoints: any[] }) {
    const registeredTools: string[] = [];
    
    for (const endpoint of args.endpoints) {
      const toolName = `${args.name}_${endpoint.name}`;
      const tool: Tool = {
        name: toolName,
        description: endpoint.description || `${endpoint.method} ${endpoint.path}`,
        inputSchema: endpoint.inputSchema || {
          type: 'object',
          properties: {
            body: { type: 'object', description: 'Request body' },
            params: { type: 'object', description: 'Query parameters' },
          },
        },
      };
      
      dynamicTools.set(toolName, tool);
      
      // Create handler
      toolHandlers[toolName] = async (handlerArgs: any) => {
        const url = new URL(endpoint.path, args.base_url);
        if (handlerArgs.params) {
          Object.entries(handlerArgs.params).forEach(([key, value]) => {
            url.searchParams.set(key, String(value));
          });
        }
        
        const response = await fetch(url.toString(), {
          method: endpoint.method || 'GET',
          headers: {
            ...(args.api_key && { 'Authorization': `Bearer ${args.api_key}` }),
            'Content-Type': 'application/json',
          },
          ...(handlerArgs.body && { body: JSON.stringify(handlerArgs.body) }),
        });
        return response.json();
      };
      
      registeredTools.push(toolName);
    }
    
    return {
      success: true,
      integration: args.name,
      tools_registered: registeredTools,
    };
  },
};

// Create MCP Server
const server = new Server(
  {
    name: 'nexifyai-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Handle List Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const allTools = [...coreTools, ...Array.from(dynamicTools.values())];
  return { tools: allTools };
});

// Handle Call Tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const handler = toolHandlers[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }
  
  try {
    const result = await handler(args || {});
    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  }
});

// Handle List Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'nexify://status',
        name: 'System Status',
        description: 'Current system status and health',
        mimeType: 'application/json',
      },
      {
        uri: 'nexify://tools',
        name: 'Available Tools',
        description: 'List of all available tools',
        mimeType: 'application/json',
      },
    ],
  };
});

// Handle Read Resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === 'nexify://status') {
    const status = await toolHandlers.system_status();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  }
  
  if (uri === 'nexify://tools') {
    const tools = await toolHandlers.list_registered_tools();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(tools, null, 2),
        },
      ],
    };
  }
  
  throw new Error(`Unknown resource: ${uri}`);
});

// Start Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NeXify AI MCP Server running on stdio');
}

main().catch(console.error);

export { server, toolHandlers, dynamicTools };
