import OpenAI from "openai";
import { getBrainLoader } from "@/lib/brain/supabase-loader";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// Knowledge Store Handler - NOW WITH SUPABASE
export async function handleKnowledgeStore(args: any) {
  const { content, category, tags = [], is_active = true } = args;

  try {
    // Generate embedding
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: content,
    });

    const vector = embedding.data[0].embedding;

    // Map category to type
    const typeMap: Record<string, string> = {
      facts: "knowledge",
      code: "code_snippet",
      conversations: "conversation",
      preferences: "preference",
    };

    // Store in Supabase
    const brainLoader = getBrainLoader("nexify-ai");
    const id = await brainLoader.addMemory(content, {
      type: (typeMap[category] || "knowledge") as any,
      scope: "project",
      importance: "medium",
      tags,
      autoLoad: false,
      embedding: vector,
    });

    return {
      stored: true,
      id,
      category,
      message: `Stored in Supabase Brain`,
    };
  } catch (error) {
    console.error("Knowledge store error:", error);
    return {
      stored: false,
      error: String(error),
      message: "Failed to store in Supabase Brain",
    };
  }
}

// Knowledge Query Handler - NOW WITH SUPABASE
export async function handleKnowledgeQuery(args: any) {
  const { query, category, limit = 5 } = args;

  try {
    // Generate query embedding
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });

    const vector = embedding.data[0].embedding;

    // Search in Supabase
    const brainLoader = getBrainLoader("nexify-ai");
    const searchResults = await brainLoader.searchMemories(vector, {
      limit,
      threshold: 0.6,
      type: category || undefined,
    });

    const results = searchResults.map((memory) => ({
      content: memory.content,
      type: memory.type,
      score: memory.similarity || 0,
      tags: memory.tags || [],
    }));

    return {
      results,
      count: results.length,
      source: "supabase",
    };
  } catch (error) {
    console.error("Knowledge query error:", error);
    return {
      results: [],
      count: 0,
      error: String(error),
      source: "supabase",
    };
  }
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

// System Status Handler - NOW WITH SUPABASE
export async function handleSystemStatus() {
  const status = {
    openai: !!process.env.OPENAI_API_KEY,
    supabase:
      !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    timestamp: new Date().toISOString(),
  };

  return { status, healthy: status.openai && status.supabase };
}
