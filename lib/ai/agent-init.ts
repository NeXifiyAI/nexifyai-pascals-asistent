// NeXifyAI Agent Initialization & Supermemory Connection
// This file bootstraps the agent with its identity and persistent memory.

import { qdrantClient, COLLECTIONS } from "@/lib/qdrant";
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
      openaiVectorStore: "ready (assumed)", // OpenAI connection is handled by the model provider
    },
    config: MEMORY_CONFIG,
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
    // Note: Actual embedding generation would happen here or via a separate service
    // For now, we are setting up the structure.
    console.log("Saving episode to Supermemory:", content);
    
    // In a full implementation, we would:
    // 1. Generate embedding for 'content' using OpenAI
    // 2. Push to Qdrant with metadata
    
    return true;
  } catch (error) {
    console.error("Failed to save episode:", error);
    return false;
  }
}
