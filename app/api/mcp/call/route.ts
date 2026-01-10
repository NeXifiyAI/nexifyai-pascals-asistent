import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Dynamic tools storage (in production, use a database)
const dynamicTools: Map<string, any> = new Map();

// AI Model routing
async function aiRoute(task: string, type?: string) {
  const taskType = type || detectTaskType(task);
  
  const modelMap: Record<string, { provider: string; model: string }> = {
    code: { provider: 'deepseek', model: 'deepseek-coder' },
    creative: { provider: 'openai', model: 'gpt-4o' },
    reasoning: { provider: 'openai', model: 'gpt-4o' },
    fast: { provider: 'openai', model: 'gpt-4o-mini' },
    vision: { provider: 'openai', model: 'gpt-4o' }
  };

  const selected = modelMap[taskType] || modelMap.reasoning;
  
  // For now, use OpenAI for all tasks
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: task }],
    max_tokens: 4096
  });

  return {
    response: response.choices[0].message?.content,
    model: selected.model,
    provider: selected.provider,
    taskType
  };
}

function detectTaskType(task: string): string {
  const lower = task.toLowerCase();
  if (lower.includes('code') || lower.includes('function') || lower.includes('program')) return 'code';
  if (lower.includes('write') || lower.includes('story') || lower.includes('creative')) return 'creative';
  if (lower.includes('analyze') || lower.includes('explain') || lower.includes('why')) return 'reasoning';
  return 'fast';
}

// Code generation
async function codeGenerate(language: string, task: string, context?: string) {
  const prompt = `Generate ${language} code for: ${task}${context ? `\n\nContext: ${context}` : ''}

Provide clean, well-commented code with best practices.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096
  });

  return {
    code: response.choices[0].message?.content,
    language
  };
}

// Code analysis
async function codeAnalyze(code: string, language?: string, focus?: string) {
  const prompt = `Analyze this ${language || ''} code:
\`\`\`
${code}
\`\`\`

Focus: ${focus || 'all'}

Provide:
1. Issues found
2. Security concerns
3. Performance improvements
4. Best practice suggestions`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096
  });

  return {
    analysis: response.choices[0].message?.content,
    focus: focus || 'all'
  };
}

// Knowledge store (Supermemory + Qdrant Dual-Write)
async function knowledgeStore(content: string, category: string, tags?: string[], is_active: boolean = true) {
  // 1. Store in Qdrant (Secondary Brain - Raw Embeddings)
  const qdrantUrl = process.env.QDRANT_URL;
  const qdrantKey = process.env.QDRANT_API_KEY;
  
  let qdrantResult = { success: false, error: 'Skipped' };
  
  if (qdrantUrl && qdrantKey) {
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: content
      });
      const embedding = embeddingResponse.data[0].embedding;
      const pointId = Date.now();
      
      const response = await fetch(`${qdrantUrl}/collections/nexify_knowledge/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'api-key': qdrantKey },
        body: JSON.stringify({
          points: [{
            id: pointId,
            vector: embedding,
            payload: { 
              content, 
              category, 
              tags: tags || [], 
              timestamp: new Date().toISOString(),
              is_active // Track active vs historical
            }
          }]
        })
      });
      qdrantResult = { success: response.ok, error: response.ok ? undefined : response.statusText };
    } catch (e: any) { qdrantResult = { success: false, error: e.message }; }
  }

  // 2. Store in Supermemory (Primary Brain - Knowledge Graph)
  // We use our centralized client for this
  const { getSupermemory } = await import('@/lib/supermemory');
  const supermemory = getSupermemory();
  
  let supermemoryResult = { success: false, error: 'Skipped' };
  
  if (supermemory) {
    try {
      const smResponse = await supermemory.addMemory({
        content,
        containerTag: category, // Map category to containerTag
        metadata: { tags, is_active }
      });
      supermemoryResult = { success: true, ...smResponse };
    } catch (e: any) { supermemoryResult = { success: false, error: e.message }; }
  }

  return { 
    success: qdrantResult.success || supermemoryResult.success,
    qdrant: qdrantResult,
    supermemory: supermemoryResult
  };
}


      case 'knowledge_store':
        result = await knowledgeStore(args.content, args.category, args.tags, args.is_active);
        break;

      case 'code_generate':
        result = await codeGenerate(args.language, args.task, args.context);
        break;
      case 'code_analyze':
        result = await codeAnalyze(args.code, args.language, args.focus);
        break;
      case 'knowledge_store':
        result = await knowledgeStore(args.content, args.category, args.tags);
        break;
      case 'knowledge_query':
        result = await knowledgeQuery(args.query, args.category, args.limit);
        break;
      case 'web_search':
        result = await webSearch(args.query, args.num_results);
        break;
      case 'register_tool':
        result = await registerTool(args.name, args.description, args.endpoint, args.method, args.parameters);
        break;
      case 'system_status':
        result = await systemStatus();
        break;
      default:
        // Check dynamic tools
        if (dynamicTools.has(tool)) {
          const dynTool = dynamicTools.get(tool);
          try {
            const response = await fetch(dynTool.endpoint, {
              method: dynTool.method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(args)
            });
            result = await response.json();
          } catch (e: any) {
            result = { error: `Dynamic tool error: ${e.message}` };
          }
        } else {
          return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
        }
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
