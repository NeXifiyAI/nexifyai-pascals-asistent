// NeXifyAI Agent Initialization & Supermemory Connection
// This file bootstraps the agent with its identity and persistent memory.

import { qdrantClient, COLLECTIONS } from "@/lib/qdrant";
import { getSupermemory } from "@/lib/supermemory";
import { systemPrompt } from "./prompts";

// Configuration for the Agent's Memory
export const MEMORY_CONFIG = {
  openaiVectorStoreId: "vs_693ff5bbf28c81918df07c5809949df0",
  qdrantClusterId: "f256664d-f56d-42e5-8fbd-e724b5f832bf",
  collections: {
    primary: COLLECTIONS.MEMORY,
  },
};

export interface AgentContext {
  modelId: string;
  requestHints?: any;
}

/**
 * Initializes the NeXifyAI Agent with its full context and memory connections.
 * This should be called at the start of a chat session or server-side operation.
 */
export async function initializeAgent(context: AgentContext) {
  // 1. Check connections
  const isQdrantConnected = await checkQdrantConnection();
  const supermemory = getSupermemory();
  const isSupermemoryReady = !!supermemory;
  
  // 2. Load System Prompt with Identity
  const prompt = systemPrompt({
    selectedChatModel: context.modelId,
    requestHints: context.requestHints || { latitude: 0, longitude: 0, city: "Unknown", country: "Unknown" },
  });

  // 3. Return the fully configured agent context
  return {
    systemPrompt: prompt,
    memoryStatus: {
      qdrant: isQdrantConnected ? "connected" : "disconnected",
      supermemory: isSupermemoryReady ? "connected" : "missing_key",
      openaiVectorStore: "ready (assumed)", // OpenAI connection is handled by the model provider
    },
    config: MEMORY_CONFIG,
    clients: {
      supermemory,
    }
  };
}

async function checkQdrantConnection(): Promise<boolean> {
  try {
    const result = await qdrantClient.getCollections();
    return !!result;
  } catch (error) {
    console.error("Failed to connect to Qdrant:", error);
    return false;
  }
}

/**
 * Writes an episodic memory to the vector database.
 * Use this to persist important events or learnings.
 */
export async function saveEpisode(content: string, metadata: Record<string, any> = {}) {
  try {
    const supermemory = getSupermemory();
    if (supermemory) {
        await supermemory.addMemory(content, metadata);
        console.log("Saved episode to Supermemory.");
    }

    // Also push to Qdrant as backup/secondary store if needed
    // (Implementation pending specific Qdrant schema details)
    
    return true;
  } catch (error) {
    console.error("Failed to save episode:", error);
    return false;
  }
}
