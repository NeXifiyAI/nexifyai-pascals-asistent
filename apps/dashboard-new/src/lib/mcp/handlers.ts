import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

const COLLECTION_NAME = "brain_memory";

// AI Route Handler
export async function handleAiRoute(args: any) {
  const { task, type = "reasoning" } = args;

  const modelMap: Record<string, string> = {
    code: "gpt-4o",
    creative: "gpt-4o",
    reasoning: "gpt-4o",
    fast: "gpt-4o-mini",
    vision: "gpt-4o",
  };

  const model = modelMap[type] || "gpt-4o";

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: task }],
  });

  return {
    result: response.choices[0].message.content,
    model_used: model,
  };
}

// Code Generation Handler
export async function handleCodeGenerate(args: any) {
  const { language, task, context = "" } = args;

  const prompt = `Generate ${language} code for: ${task}\n\nContext: ${context}\n\nProvide only the code, no explanations.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  return {
    code: response.choices[0].message.content,
    language,
  };
}

// Code Analysis Handler
export async function handleCodeAnalyze(args: any) {
  const { code, language = "unknown", focus = "all" } = args;

  const focusMap: Record<string, string> = {
    performance: "performance optimization",
    security: "security vulnerabilities",
    style: "code style and readability",
    bugs: "potential bugs",
    all: "all aspects (bugs, security, performance, style)",
  };

  const prompt = `Analyze this ${language} code for ${focusMap[focus]}:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide specific issues and recommendations.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  return {
    analysis: response.choices[0].message.content,
    focus,
  };
}

// Knowledge Store Handler
export async function handleKnowledgeStore(args: any) {
  const { content, category, tags = [], is_active = true } = args;

  // Generate embedding
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: content,
  });

  const vector = embedding.data[0].embedding;
  const id = `mem-${Date.now()}`;

  // Map category to type
  const typeMap: Record<string, string> = {
    facts: "fact",
    code: "code",
    conversations: "conversation",
    preferences: "preference",
  };

  // Store in Qdrant
  await qdrantClient.upsert(COLLECTION_NAME, {
    points: [
      {
        id,
        vector,
        payload: {
          content,
          type: typeMap[category] || "fact",
          is_active,
          tags,
          timestamp: Date.now(),
          source: "user",
        },
      },
    ],
  });

  return {
    stored: true,
    id,
    category,
    message: `Stored in ${COLLECTION_NAME}`,
  };
}

// Knowledge Query Handler
export async function handleKnowledgeQuery(args: any) {
  const { query, category, limit = 5 } = args;

  // Generate query embedding
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  const vector = embedding.data[0].embedding;

  // Search in Qdrant
  const searchResult = await qdrantClient.search(COLLECTION_NAME, {
    vector,
    limit,
    with_payload: true,
    filter: category
      ? {
          must: [{ key: "type", match: { value: category } }],
        }
      : undefined,
  });

  const results = searchResult.map((hit: any) => ({
    content: hit.payload?.content,
    type: hit.payload?.type,
    score: hit.score,
    tags: hit.payload?.tags || [],
  }));

  return {
    results,
    count: results.length,
  };
}

// Web Search Handler (Placeholder)
export async function handleWebSearch(args: any) {
  const { query, num_results = 5 } = args;

  // TODO: Integrate with Tavily/Serper/Brave Search API
  return {
    message: "Web search coming soon",
    query,
    suggestion: "Use Tavily API or Brave Search API for implementation",
  };
}

// System Status Handler
export async function handleSystemStatus() {
  const status = {
    openai: !!process.env.OPENAI_API_KEY,
    qdrant: !!process.env.QDRANT_URL && !!process.env.QDRANT_API_KEY,
    timestamp: new Date().toISOString(),
  };

  return { status, healthy: status.openai && status.qdrant };
}
