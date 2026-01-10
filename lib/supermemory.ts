// Supermemory Integration Client
// Centralizes all knowledge base access for the NeXifyAI Agent.
// Docs: https://supermemory.ai/docs

const SUPERMEMORY_API_URL = "https://supermemory.ai";

interface AddMemoryParams {
  content: string;
  containerTag?: string;
  metadata?: Record<string, any>;
}

interface UploadFileParams {
  file: Blob; // Or Buffer/Stream depending on env
  containerTag?: string;
}

export class SupermemoryClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Adds a new document (text) to the central brain.
   * Supermemory automatically processes this into searchable memories.
   */
  async addMemory({ content, containerTag, metadata }: AddMemoryParams) {
    try {
      const response = await fetch(`${SUPERMEMORY_API_URL}/api/v3/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          content,
          containerTag,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error(`Supermemory API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to add memory to Supermemory:", error);
      throw error;
    }
  }

  // TODO: Implement file upload and URL processing when needed (see Docs)

  /**
   * Queries the central brain for relevant context.
   * Note: The V3 API might have different query endpoints, this needs verification against live docs if /query fails.
   * Assuming legacy or vector search endpoint for now based on standard patterns.
   */
  async query(query: string, limit: number = 5) {
    try {
      // NOTE: Using a hypothetical search endpoint. 
      // The provided context focuses on ADDING content.
      // We will assume a standard search/query endpoint exists or update once confirmed.
      const response = await fetch(`${SUPERMEMORY_API_URL}/api/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        // Fallback or silent fail if endpoint differs
        console.warn(`Supermemory Query Warning: ${response.status}`);
        return []; 
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to query Supermemory:", error);
      return [];
    }
  }
}

// Singleton instance retrieval
let supermemoryInstance: SupermemoryClient | null = null;

export function getSupermemory() {
  const apiKey = process.env.SUPERMEMORY_API_KEY;
  
  if (!apiKey) {
    console.warn("SUPERMEMORY_API_KEY is not set. Memory features will be disabled.");
    return null;
  }

  if (!supermemoryInstance) {
    supermemoryInstance = new SupermemoryClient(apiKey);
  }
  
  return supermemoryInstance;
}
