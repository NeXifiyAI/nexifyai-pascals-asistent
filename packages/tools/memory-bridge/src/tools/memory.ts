import { z } from "zod";

/**
 * A tool that bridges to the external memory service (Supabase/Qdrant).
 *
 * Note: To make this functional, you will need to integrate with your actual
 * Supabase or Qdrant client.
 */

// Mock in-memory store for prototype
const MOCK_MEMORY_STORE: Record<string, any[]> = {
  facts: [],
  preferences: [],
  conversations: [],
};

// ============= STORE KNOWLEDGE =============

export const storeKnowledgeSchema = z.object({
  content: z.string().describe("The actual content to store."),
  category: z
    .enum(["facts", "preferences", "conversations", "code"])
    .describe("The category of the information."),
  tags: z
    .array(z.string())
    .describe("Tags to help retrieve this information later."),
});

export type StoreKnowledgeInput = z.infer<typeof storeKnowledgeSchema>;

export const storeKnowledgeDescription =
  "Stores information in the long-term memory (Knowledge Base). Use this to save facts, user preferences, or important context that should persist across sessions.";

export async function storeKnowledgeExecute({
  content,
  category,
  tags,
}: StoreKnowledgeInput) {
  console.log(
    `[Memory Bridge] Storing in ${category}: "${content}" [Tags: ${tags.join(", ")}]`,
  );

  // TODO: INTEGRATION POINT -> Supabase / Qdrant Insert
  // await supabase.from('memories').insert({ content, category, tags, embedding: ... });

  if (!MOCK_MEMORY_STORE[category]) MOCK_MEMORY_STORE[category] = [];
  MOCK_MEMORY_STORE[category].push({
    content,
    tags,
    timestamp: new Date().toISOString(),
  });

  return {
    status: "success",
    message: "Information stored successfully in long-term memory.",
    id: "mock-id-" + Date.now(),
  };
}

/**
 * Tool definition object (for use with AI SDK's tool() helper)
 */
export const storeKnowledge = {
  description: storeKnowledgeDescription,
  parameters: storeKnowledgeSchema,
  execute: storeKnowledgeExecute,
};

// ============= QUERY KNOWLEDGE =============

export const queryKnowledgeSchema = z.object({
  query: z.string().describe("The search query to find relevant memories."),
  category: z
    .enum(["facts", "preferences", "conversations", "code"])
    .optional()
    .describe("Optional filter by category."),
  limit: z.number().optional().describe("Max number of results to return."),
});

export type QueryKnowledgeInput = z.infer<typeof queryKnowledgeSchema>;

export const queryKnowledgeDescription =
  "Retrieves information from the long-term memory. Use this before answering questions that might rely on past context.";

export async function queryKnowledgeExecute({
  query,
  category,
  limit = 5,
}: QueryKnowledgeInput) {
  console.log(
    `[Memory Bridge] Querying: "${query}" (Category: ${category || "all"})`,
  );

  // TODO: INTEGRATION POINT -> Supabase / Qdrant Vector Search
  // const { data } = await supabase.rpc('match_documents', { query_embedding: ..., filter: ... });

  // Mock Retrieval Logic
  let results: any[] = [];
  if (category && MOCK_MEMORY_STORE[category]) {
    results = MOCK_MEMORY_STORE[category];
  } else {
    // Flatten all categories
    Object.values(MOCK_MEMORY_STORE).forEach((arr) => results.push(...arr));
  }

  // Simple mock filter (contains string)
  const filtered = results
    .filter((item) => item.content.toLowerCase().includes(query.toLowerCase()))
    .slice(0, limit);

  return {
    status: "success",
    query,
    results:
      filtered.length > 0
        ? filtered
        : [
            {
              content: "No relevant memories found for this query.",
              similarity: 0,
            },
          ],
  };
}

/**
 * Tool definition object (for use with AI SDK's tool() helper)
 */
export const queryKnowledge = {
  description: queryKnowledgeDescription,
  parameters: queryKnowledgeSchema,
  execute: queryKnowledgeExecute,
};
