import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Legacy resources configuration (from env or defaults)
const LEGACY_RESOURCES = {
  assistantId:
    process.env.LEGACY_ASSISTANT_ID || "asst_NZtoNWLUW58mWYXLXxV6xeR5",
  qdrant: {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Dynamic tools storage (in production, use a database)
const dynamicTools: Map<string, any> = new Map();

// AI Model routing
async function aiRoute(task: string, type?: string) {
  const taskType = type || detectTaskType(task);

  const modelMap: Record<string, { provider: string; model: string }> = {
    code: { provider: "deepseek", model: "deepseek-coder" },
    creative: { provider: "openai", model: "gpt-4o" },
    reasoning: { provider: "openai", model: "gpt-4o" },
    fast: { provider: "openai", model: "gpt-4o-mini" },
    vision: { provider: "openai", model: "gpt-4o" },
  };

  const selected = modelMap[taskType] || modelMap.reasoning;

  // For now, use OpenAI for all tasks
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: task }],
    max_tokens: 4096,
  });

  return {
    response: response.choices[0].message?.content,
    model: selected.model,
    provider: selected.provider,
    taskType,
  };
}

function detectTaskType(task: string): string {
  const lower = task.toLowerCase();
  if (
    lower.includes("code") ||
    lower.includes("function") ||
    lower.includes("program")
  )
    return "code";
  if (
    lower.includes("write") ||
    lower.includes("story") ||
    lower.includes("creative")
  )
    return "creative";
  if (
    lower.includes("analyze") ||
    lower.includes("explain") ||
    lower.includes("why")
  )
    return "reasoning";
  return "fast";
}

// Code generation
async function codeGenerate(language: string, task: string, context?: string) {
  const prompt = `Generate ${language} code for: ${task}${context ? `\n\nContext: ${context}` : ""}

Provide clean, well-commented code with best practices.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4096,
  });

  return {
    code: response.choices[0].message?.content,
    language,
  };
}

// Code analysis
async function codeAnalyze(code: string, language?: string, focus?: string) {
  const prompt = `Analyze this ${language || ""} code:
\`\`\`
${code}
\`\`\`

Focus: ${focus || "all"}

Provide:
1. Issues found
2. Security concerns
3. Performance improvements
4. Best practice suggestions`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4096,
  });

  return {
    analysis: response.choices[0].message?.content,
    focus: focus || "all",
  };
}

// Knowledge store (Supermemory + Qdrant Dual-Write)
async function knowledgeStore(
  content: string,
  category: string,
  tags?: string[],
  is_active: boolean = true,
) {
  // 1. Store in Qdrant (Secondary Brain - Raw Embeddings)
  // Use LEGACY_RESOURCES for legacy Qdrant cluster if no env vars are set
  const qdrantUrl = process.env.QDRANT_URL || LEGACY_RESOURCES.qdrant?.url;
  const qdrantKey =
    process.env.QDRANT_API_KEY || LEGACY_RESOURCES.qdrant?.apiKey;

  let qdrantResult = { success: false, error: "Skipped" };

  if (qdrantUrl && qdrantKey) {
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });
      const embedding = embeddingResponse.data[0].embedding;
      const pointId = Date.now();

      const response = await fetch(
        `${qdrantUrl}/collections/nexify_knowledge/points`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", "api-key": qdrantKey },
          body: JSON.stringify({
            points: [
              {
                id: pointId,
                vector: embedding,
                payload: {
                  content,
                  category,
                  tags: tags || [],
                  timestamp: new Date().toISOString(),
                  is_active, // Track active vs historical
                },
              },
            ],
          }),
        },
      );
      qdrantResult = {
        success: response.ok,
        error: response.ok ? "None" : response.statusText || "Unknown Error",
      };
    } catch (e: any) {
      qdrantResult = { success: false, error: e.message };
    }
  }

  // 2. Store in Supermemory (Primary Brain - Knowledge Graph)
  // We use our centralized client for this
  const { getSupermemory } = await import("@/lib/supermemory");
  const supermemory = getSupermemory();

  let supermemoryResult = { success: false, error: "Skipped" };

  if (supermemory) {
    try {
      const smResponse = await supermemory.addMemory({
        content,
        containerTag: category, // Map category to containerTag
        metadata: { tags, is_active },
      });
      supermemoryResult = { success: true, ...smResponse };
    } catch (e: any) {
      supermemoryResult = { success: false, error: e.message };
    }
  }

  return {
    success: qdrantResult.success || supermemoryResult.success,
    qdrant: qdrantResult,
    supermemory: supermemoryResult,
  };
}

// Knowledge query
async function knowledgeQuery(
  query: string,
  category?: string,
  limit?: number,
) {
  const qdrantUrl = process.env.QDRANT_URL || LEGACY_RESOURCES.qdrant?.url;
  const qdrantKey =
    process.env.QDRANT_API_KEY || LEGACY_RESOURCES.qdrant?.apiKey;

  if (!qdrantUrl || !qdrantKey) {
    return { results: [], error: "Qdrant not configured" };
  }

  try {
    // Generate query embedding
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Search in Qdrant
    const searchBody: any = {
      vector: embedding,
      limit: limit || 5,
      with_payload: true,
    };

    if (category) {
      searchBody.filter = {
        must: [{ key: "category", match: { value: category } }],
      };
    }

    const response = await fetch(
      `${qdrantUrl}/collections/nexify_knowledge/points/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": qdrantKey,
        },
        body: JSON.stringify(searchBody),
      },
    );

    const data = await response.json();
    return {
      results:
        data.result?.map((r: any) => ({
          content: r.payload?.content,
          category: r.payload?.category,
          score: r.score,
        })) || [],
    };
  } catch (error: any) {
    return { results: [], error: error.message };
  }
}

// Legacy Assistant Query
async function askLegacyAssistant(question: string) {
  try {
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: question,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: LEGACY_RESOURCES.assistantId,
      additional_instructions:
        "Please search your file search tool and vector stores for the answer.",
    });

    // Poll for completion
    // Correct order for newer OpenAI SDK: (threadId, runId)
    let runStatus = await (openai.beta.threads.runs.retrieve as any)(
      thread.id,
      run.id,
    );

    while (runStatus.status !== "completed") {
      if (runStatus.status === "failed")
        throw new Error("Assistant run failed");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await (openai.beta.threads.runs.retrieve as any)(
        thread.id,
        run.id,
      );
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const answer = messages.data[0].content[0];

    if (answer.type === "text") {
      return { response: answer.text.value };
    }
    return {
      response:
        "Complex response type received (image/file), please check OpenAI dashboard.",
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

// Web search (using a simple approach)
async function webSearch(query: string, numResults?: number) {
  // For production, integrate with a real search API
  return {
    query,
    note: "Web search requires external API integration. Consider using Serper, Tavily, or similar.",
    suggestion: "The AI can still answer based on its training data.",
  };
}

// Register tool (self-extension)
async function registerTool(
  name: string,
  description: string,
  endpoint: string,
  method?: string,
  parameters?: any,
) {
  dynamicTools.set(name, {
    name,
    description,
    endpoint,
    method: method || "POST",
    parameters: parameters || {},
    registeredAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: `Tool '${name}' registered successfully`,
    totalDynamicTools: dynamicTools.size,
  };
}

// System status
async function systemStatus() {
  return {
    status: "operational",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    tools: {
      core: 9, // Updated count including legacy assistant
      dynamic: dynamicTools.size,
    },
    integrations: {
      openai: !!process.env.OPENAI_API_KEY,
      deepseek: !!process.env.DEEPSEEK_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      qdrant: !!process.env.QDRANT_API_KEY || !!LEGACY_RESOURCES.qdrant?.apiKey,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const { tool, arguments: args } = await request.json();

    let result;
    switch (tool) {
      case "ai_route":
        result = await aiRoute(args.task, args.type);
        break;
      case "code_generate":
        result = await codeGenerate(args.language, args.task, args.context);
        break;
      case "code_analyze":
        result = await codeAnalyze(args.code, args.language, args.focus);
        break;
      case "knowledge_store":
        result = await knowledgeStore(
          args.content,
          args.category,
          args.tags,
          args.is_active,
        );
        break;
      case "knowledge_query":
        result = await knowledgeQuery(args.query, args.category, args.limit);
        break;
      case "ask_legacy_assistant":
        result = await askLegacyAssistant(args.question);
        break;
      case "web_search":
        result = await webSearch(args.query, args.num_results);
        break;
      case "register_tool":
        result = await registerTool(
          args.name,
          args.description,
          args.endpoint,
          args.method,
          args.parameters,
        );
        break;
      case "system_status":
        result = await systemStatus();
        break;
      default:
        // Check dynamic tools
        if (dynamicTools.has(tool)) {
          const dynTool = dynamicTools.get(tool);
          try {
            const response = await fetch(dynTool.endpoint, {
              method: dynTool.method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(args),
            });
            result = await response.json();
          } catch (e: any) {
            result = { error: `Dynamic tool error: ${e.message}` };
          }
        } else {
          return NextResponse.json(
            { error: `Unknown tool: ${tool}` },
            { status: 400 },
          );
        }
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
