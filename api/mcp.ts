/**
 * Vercel Serverless Function for NeXify AI MCP Server
 * HTTP-based MCP endpoint for web access
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    url: process.env.QDRANT_URL || '',
    apiKey: process.env.QDRANT_API_KEY || '',
  },
  github: {
    token: process.env.GITHUB_TOKEN || '',
  },
  auth: {
    secret: process.env.AUTH_SECRET || '',
  },
};

// Dynamic Tool Registry
const dynamicTools: Map<string, any> = new Map();

// Tool Handlers
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  // ==========================================
  // AI PROVIDER TOOLS
  // ==========================================
  
  async ask_openai(args: { prompt: string; system?: string; max_tokens?: number }) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: args.max_tokens && args.max_tokens > 4096 ? 'gpt-4-turbo-preview' : 'gpt-4o-mini',
        messages: [
          ...(args.system ? [{ role: 'system', content: args.system }] : []),
          { role: 'user', content: args.prompt },
        ],
        max_tokens: args.max_tokens || 4096,
      }),
    });
    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || data, model: 'openai' };
  },

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
    return { content: data.choices?.[0]?.message?.content || data, model: 'deepseek' };
  },

  async ask_openrouter(args: { prompt: string; model?: string }) {
    const response = await fetch(`${config.openrouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nexifyai-pascals-asistent.vercel.app',
      },
      body: JSON.stringify({
        model: args.model || 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: args.prompt }],
      }),
    });
    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || data, model: 'openrouter' };
  },

  async ask_huggingface(args: { model: string; inputs: string }) {
    const response = await fetch(`https://api-inference.huggingface.co/models/${args.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.huggingface.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: args.inputs }),
    });
    return { content: await response.json(), model: 'huggingface' };
  },

  // Smart Router - Automatically selects best model
  async smart_ask(args: { prompt: string; task_type?: string; priority?: string }) {
    const taskType = args.task_type || 'general';
    const priority = args.priority || 'balanced';
    
    // Route based on task type and priority
    if (taskType === 'code' || args.prompt.toLowerCase().includes('code')) {
      return toolHandlers.ask_deepseek({ prompt: args.prompt, model: 'deepseek-coder' });
    }
    if (priority === 'cost') {
      return toolHandlers.ask_deepseek({ prompt: args.prompt });
    }
    if (priority === 'quality') {
      return toolHandlers.ask_openai({ prompt: args.prompt });
    }
    // Default: OpenRouter for best price/performance
    return toolHandlers.ask_openrouter({ prompt: args.prompt });
  },

  // ==========================================
  // QDRANT VECTOR DATABASE TOOLS
  // ==========================================

  async qdrant_search(args: { collection: string; query: string; limit?: number }) {
    // Generate embedding
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

    if (!vector) throw new Error('Failed to generate embedding');

    // Search Qdrant
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

  async qdrant_upsert(args: { collection: string; id: string; text: string; metadata?: any }) {
    // Generate embedding
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
          payload: { text: args.text, ...args.metadata, timestamp: new Date().toISOString() },
        }],
      }),
    });
    return upsertResponse.json();
  },

  async qdrant_list_collections() {
    const response = await fetch(`${config.qdrant.url}/collections`, {
      headers: { 'api-key': config.qdrant.apiKey },
    });
    return response.json();
  },

  async qdrant_create_collection(args: { name: string; vector_size?: number }) {
    const response = await fetch(`${config.qdrant.url}/collections/${args.name}`, {
      method: 'PUT',
      headers: {
        'api-key': config.qdrant.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: { size: args.vector_size || 1536, distance: 'Cosine' },
      }),
    });
    return response.json();
  },

  // Multi-collection search (Dual-Brain)
  async qdrant_multi_search(args: { query: string; collections?: string[]; limit?: number }) {
    const collections = args.collections || ['semantic_memory', 'episodic_memory', 'procedural_memory'];
    const results = await Promise.all(
      collections.map(collection => 
        toolHandlers.qdrant_search({ collection, query: args.query, limit: args.limit || 3 })
          .catch(() => ({ result: [], collection, error: 'Collection not found' }))
      )
    );
    return { query: args.query, results };
  },

  // ==========================================
  // GITHUB TOOLS
  // ==========================================

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

  async github_update_file(args: { owner: string; repo: string; path: string; content: string; message: string; branch?: string }) {
    let sha: string | undefined;
    try {
      const existing = await toolHandlers.github_get_file(args);
      sha = existing.sha;
    } catch {}

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

  async github_list_files(args: { owner: string; repo: string; path?: string; branch?: string }) {
    const url = `https://api.github.com/repos/${args.owner}/${args.repo}/contents/${args.path || ''}?ref=${args.branch || 'main'}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.github.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    return response.json();
  },

  // ==========================================
  // SELF-EXTENSION TOOLS
  // ==========================================

  async register_tool(args: { name: string; description: string; inputSchema: any; handler_code: string }) {
    dynamicTools.set(args.name, {
      name: args.name,
      description: args.description,
      inputSchema: args.inputSchema,
      handler_code: args.handler_code,
    });
    
    // Create handler dynamically
    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const handler = new AsyncFunction('args', 'config', 'fetch', args.handler_code);
      toolHandlers[args.name] = async (handlerArgs: any) => handler(handlerArgs, config, fetch);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
    
    return { success: true, tool: args.name };
  },

  async list_tools() {
    const coreToolNames = Object.keys(toolHandlers).filter(name => !dynamicTools.has(name));
    return {
      core_tools: coreToolNames,
      dynamic_tools: Array.from(dynamicTools.keys()),
      total: coreToolNames.length + dynamicTools.size,
    };
  },

  async remove_tool(args: { name: string }) {
    if (dynamicTools.has(args.name)) {
      dynamicTools.delete(args.name);
      delete toolHandlers[args.name];
      return { success: true };
    }
    return { success: false, message: 'Tool not found or is a core tool' };
  },

  // ==========================================
  // CODE GENERATION & ANALYSIS
  // ==========================================

  async generate_code(args: { language: string; description: string; context?: string }) {
    const prompt = `Generate production-ready ${args.language} code:

Description: ${args.description}
${args.context ? `Context: ${args.context}` : ''}

Requirements:
- Type hints/annotations
- Clear comments
- Error handling
- Best practices

Respond with ONLY the code.`;

    return toolHandlers.ask_deepseek({ prompt, model: 'deepseek-coder' });
  },

  async analyze_code(args: { code: string; language?: string }) {
    const prompt = `Analyze this ${args.language || ''} code:

\`\`\`
${args.code}
\`\`\`

Check for:
1. Bugs
2. Security issues
3. Performance
4. Best practices

Provide actionable recommendations.`;

    return toolHandlers.ask_openai({ prompt });
  },

  // ==========================================
  // KNOWLEDGE MANAGEMENT (Dual-Brain)
  // ==========================================

  async store_knowledge(args: { content: string; type: string; tags?: string[] }) {
    const collection = `${args.type}_memory`;
    const id = `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return toolHandlers.qdrant_upsert({
      collection,
      id,
      text: args.content,
      metadata: { type: args.type, tags: args.tags || [] },
    });
  },

  async query_knowledge(args: { query: string; type?: string; limit?: number }) {
    if (args.type) {
      return toolHandlers.qdrant_search({
        collection: `${args.type}_memory`,
        query: args.query,
        limit: args.limit || 5,
      });
    }
    return toolHandlers.qdrant_multi_search({ query: args.query, limit: args.limit });
  },

  // ==========================================
  // SYSTEM & UTILITY
  // ==========================================

  async system_status() {
    return {
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      tools: {
        core: Object.keys(toolHandlers).filter(k => !dynamicTools.has(k)).length,
        dynamic: dynamicTools.size,
      },
      integrations: {
        openai: !!config.openai.apiKey,
        deepseek: !!config.deepseek.apiKey,
        openrouter: !!config.openrouter.apiKey,
        huggingface: !!config.huggingface.apiKey,
        qdrant: !!config.qdrant.apiKey,
        github: !!config.github.token,
      },
    };
  },

  // Add new API integration
  async add_api_integration(args: { name: string; base_url: string; api_key?: string; endpoints: any[] }) {
    const registeredTools: string[] = [];
    
    for (const endpoint of args.endpoints) {
      const toolName = `${args.name}_${endpoint.name}`;
      dynamicTools.set(toolName, {
        name: toolName,
        description: endpoint.description || `${endpoint.method} ${endpoint.path}`,
        inputSchema: endpoint.inputSchema || { type: 'object', properties: {} },
      });
      
      const baseUrl = args.base_url;
      const apiKey = args.api_key;
      const method = endpoint.method || 'GET';
      const path = endpoint.path;
      
      toolHandlers[toolName] = async (handlerArgs: any) => {
        const url = new URL(path, baseUrl);
        if (handlerArgs.params) {
          Object.entries(handlerArgs.params).forEach(([key, value]) => {
            url.searchParams.set(key, String(value));
          });
        }
        
        const response = await fetch(url.toString(), {
          method,
          headers: {
            ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
            'Content-Type': 'application/json',
          },
          ...(handlerArgs.body && { body: JSON.stringify(handlerArgs.body) }),
        });
        return response.json();
      };
      
      registeredTools.push(toolName);
    }
    
    return { success: true, integration: args.name, tools: registeredTools };
  },

  // Master Query - The main entry point for NeXify AI
  async ask_nexify_master(args: { query: string; context?: any }) {
    // 1. Search knowledge base for context
    const knowledge = await toolHandlers.qdrant_multi_search({ 
      query: args.query, 
      limit: 3 
    }).catch(() => null);
    
    // 2. Build enhanced prompt
    const enhancedPrompt = `You are NeXify AI Master - Supreme Autonomous General Intelligence.

${knowledge ? `Relevant Knowledge:\n${JSON.stringify(knowledge, null, 2)}\n\n` : ''}${args.context ? `Additional Context:\n${JSON.stringify(args.context, null, 2)}\n\n` : ''}User Query: ${args.query}

Respond with German Engineering precision. Be thorough, accurate, and actionable.`;
    
    // 3. Use smart routing
    return toolHandlers.smart_ask({ prompt: enhancedPrompt, priority: 'quality' });
  },
};

// Tool definitions for MCP protocol
const tools = [
  { name: 'ask_openai', description: 'Query OpenAI GPT-4', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, system: { type: 'string' }, max_tokens: { type: 'number' } }, required: ['prompt'] } },
  { name: 'ask_deepseek', description: 'Query DeepSeek (cost-effective)', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, model: { type: 'string' } }, required: ['prompt'] } },
  { name: 'ask_openrouter', description: 'Query via OpenRouter', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, model: { type: 'string' } }, required: ['prompt'] } },
  { name: 'ask_huggingface', description: 'Query Hugging Face', inputSchema: { type: 'object', properties: { model: { type: 'string' }, inputs: { type: 'string' } }, required: ['model', 'inputs'] } },
  { name: 'smart_ask', description: 'Smart routing to best AI model', inputSchema: { type: 'object', properties: { prompt: { type: 'string' }, task_type: { type: 'string' }, priority: { type: 'string' } }, required: ['prompt'] } },
  { name: 'qdrant_search', description: 'Search Qdrant vectors', inputSchema: { type: 'object', properties: { collection: { type: 'string' }, query: { type: 'string' }, limit: { type: 'number' } }, required: ['collection', 'query'] } },
  { name: 'qdrant_upsert', description: 'Upsert vectors to Qdrant', inputSchema: { type: 'object', properties: { collection: { type: 'string' }, id: { type: 'string' }, text: { type: 'string' }, metadata: { type: 'object' } }, required: ['collection', 'id', 'text'] } },
  { name: 'qdrant_list_collections', description: 'List Qdrant collections', inputSchema: { type: 'object', properties: {} } },
  { name: 'qdrant_create_collection', description: 'Create Qdrant collection', inputSchema: { type: 'object', properties: { name: { type: 'string' }, vector_size: { type: 'number' } }, required: ['name'] } },
  { name: 'qdrant_multi_search', description: 'Search multiple collections', inputSchema: { type: 'object', properties: { query: { type: 'string' }, collections: { type: 'array' }, limit: { type: 'number' } }, required: ['query'] } },
  { name: 'github_get_file', description: 'Get file from GitHub', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, path: { type: 'string' }, branch: { type: 'string' } }, required: ['owner', 'repo', 'path'] } },
  { name: 'github_update_file', description: 'Update/create file on GitHub', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, path: { type: 'string' }, content: { type: 'string' }, message: { type: 'string' }, branch: { type: 'string' } }, required: ['owner', 'repo', 'path', 'content', 'message'] } },
  { name: 'github_list_files', description: 'List files in GitHub repo', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, repo: { type: 'string' }, path: { type: 'string' }, branch: { type: 'string' } }, required: ['owner', 'repo'] } },
  { name: 'register_tool', description: 'Register new tool dynamically', inputSchema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, inputSchema: { type: 'object' }, handler_code: { type: 'string' } }, required: ['name', 'description', 'inputSchema', 'handler_code'] } },
  { name: 'list_tools', description: 'List all tools', inputSchema: { type: 'object', properties: {} } },
  { name: 'remove_tool', description: 'Remove dynamic tool', inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
  { name: 'generate_code', description: 'Generate code', inputSchema: { type: 'object', properties: { language: { type: 'string' }, description: { type: 'string' }, context: { type: 'string' } }, required: ['language', 'description'] } },
  { name: 'analyze_code', description: 'Analyze code', inputSchema: { type: 'object', properties: { code: { type: 'string' }, language: { type: 'string' } }, required: ['code'] } },
  { name: 'store_knowledge', description: 'Store in knowledge base', inputSchema: { type: 'object', properties: { content: { type: 'string' }, type: { type: 'string' }, tags: { type: 'array' } }, required: ['content', 'type'] } },
  { name: 'query_knowledge', description: 'Query knowledge base', inputSchema: { type: 'object', properties: { query: { type: 'string' }, type: { type: 'string' }, limit: { type: 'number' } }, required: ['query'] } },
  { name: 'system_status', description: 'Get system status', inputSchema: { type: 'object', properties: {} } },
  { name: 'add_api_integration', description: 'Add new API integration', inputSchema: { type: 'object', properties: { name: { type: 'string' }, base_url: { type: 'string' }, api_key: { type: 'string' }, endpoints: { type: 'array' } }, required: ['name', 'base_url', 'endpoints'] } },
  { name: 'ask_nexify_master', description: 'Main NeXify AI query endpoint', inputSchema: { type: 'object', properties: { query: { type: 'string' }, context: { type: 'object' } }, required: ['query'] } },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authentication check
  const authHeader = req.headers.authorization;
  if (authHeader && config.auth.secret) {
    const token = authHeader.replace('Bearer ', '');
    if (token !== config.auth.secret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    // MCP Protocol endpoints
    const path = req.url?.split('?')[0] || '';
    
    // GET /api/mcp - Return server info
    if (req.method === 'GET' && (path === '/api/mcp' || path === '/api/mcp/')) {
      return res.json({
        name: 'nexifyai-mcp-server',
        version: '1.0.0',
        protocol: 'mcp',
        capabilities: ['tools', 'resources'],
        endpoints: {
          tools: '/api/mcp/tools',
          call: '/api/mcp/call',
          status: '/api/mcp/status',
        },
      });
    }

    // GET /api/mcp/tools - List all tools
    if (req.method === 'GET' && path.endsWith('/tools')) {
      const allTools = [...tools, ...Array.from(dynamicTools.values())];
      return res.json({ tools: allTools });
    }

    // GET /api/mcp/status - System status
    if (req.method === 'GET' && path.endsWith('/status')) {
      const status = await toolHandlers.system_status();
      return res.json(status);
    }

    // POST /api/mcp/call - Call a tool
    if (req.method === 'POST' && path.endsWith('/call')) {
      const { tool, arguments: args } = req.body;
      
      if (!tool) {
        return res.status(400).json({ error: 'Tool name required' });
      }
      
      const handler = toolHandlers[tool];
      if (!handler) {
        return res.status(404).json({ error: `Unknown tool: ${tool}` });
      }
      
      const result = await handler(args || {});
      return res.json({ tool, result });
    }

    // POST /api/mcp - Generic MCP request handler
    if (req.method === 'POST') {
      const { method, params } = req.body;
      
      switch (method) {
        case 'initialize':
          return res.json({
            protocolVersion: '1.0',
            serverInfo: { name: 'nexifyai-mcp-server', version: '1.0.0' },
            capabilities: { tools: {}, resources: {} },
          });
        
        case 'tools/list':
          const allTools = [...tools, ...Array.from(dynamicTools.values())];
          return res.json({ tools: allTools });
        
        case 'tools/call':
          const { name, arguments: callArgs } = params || {};
          const toolHandler = toolHandlers[name];
          if (!toolHandler) {
            return res.status(404).json({ error: `Unknown tool: ${name}` });
          }
          const toolResult = await toolHandler(callArgs || {});
          return res.json({
            content: [{
              type: 'text',
              text: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2),
            }],
          });
        
        default:
          return res.status(400).json({ error: `Unknown method: ${method}` });
      }
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error('MCP Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
