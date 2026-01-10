// Supermemory Integration Client
// Centralizes all knowledge base access for the NeXifyAI Agent.

const SUPERMEMORY_API_URL = "https://api.supermemory.ai"; // Assuming standard endpoint, verify if different

export class SupermemoryClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Adds a new memory/knowledge item to the central brain.
   */
  async addMemory(content: string, metadata?: Record<string, any>) {
    try {
      const response = await fetch(`${SUPERMEMORY_API_URL}/api/v1/memories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          content,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Supermemory API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to add memory to Supermemory:", error);
      throw error;
    }
  }

  /**
   * Queries the central brain for relevant context.
   */
  async query(query: string, limit: number = 5) {
    try {
      const response = await fetch(`${SUPERMEMORY_API_URL}/api/v1/query?q=${encodeURIComponent(query)}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Supermemory API Error: ${response.statusText}`);
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
