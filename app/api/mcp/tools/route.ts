import { NextResponse } from 'next/server';

const TOOLS = [
  {
    name: 'ai_route',
    description: 'Route task to the best AI model based on task type',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'The task or question' },
        type: { type: 'string', enum: ['code', 'creative', 'reasoning', 'fast', 'vision'], description: 'Task type for model selection' }
      },
      required: ['task']
    }
  },
  {
    name: 'code_generate',
    description: 'Generate code in any programming language',
    inputSchema: {
      type: 'object',
      properties: {
        language: { type: 'string', description: 'Programming language' },
        task: { type: 'string', description: 'What the code should do' },
        context: { type: 'string', description: 'Additional context' }
      },
      required: ['language', 'task']
    }
  },
  {
    name: 'code_analyze',
    description: 'Analyze code for bugs, security issues, and improvements',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code to analyze' },
        language: { type: 'string', description: 'Programming language' },
        focus: { type: 'string', enum: ['performance', 'security', 'style', 'bugs', 'all'], description: 'Analysis focus' }
      },
      required: ['code']
    }
  },
  {
    name: 'knowledge_store',
    description: 'Store knowledge in long-term memory (Qdrant vector DB)',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Content to store' },
        category: { type: 'string', enum: ['facts', 'code', 'conversations', 'preferences'], description: 'Category' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorization' },
        is_active: { type: 'boolean', description: 'Is this current active truth? (Default: true)' }
      },
      required: ['content', 'category']
    }
  },
  {
    name: 'knowledge_query',
    description: 'Query stored knowledge from memory',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        category: { type: 'string', description: 'Filter by category' },
        limit: { type: 'number', description: 'Number of results' }
      },
      required: ['query']
    }
  },
  {
    name: 'web_search',
    description: 'Search the web for current information',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        num_results: { type: 'number', description: 'Number of results' }
      },
      required: ['query']
    }
  },
  {
    name: 'register_tool',
    description: 'Register a new tool dynamically (self-extension)',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tool name' },
        description: { type: 'string', description: 'Tool description' },
        endpoint: { type: 'string', description: 'API endpoint' },
        method: { type: 'string', enum: ['GET', 'POST'], description: 'HTTP method' },
        parameters: { type: 'object', description: 'Parameter schema' }
      },
      required: ['name', 'description', 'endpoint']
    }
  },
  {
    name: 'system_status',
    description: 'Get system status and health information',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

export async function GET() {
  return NextResponse.json({ tools: TOOLS });
}
