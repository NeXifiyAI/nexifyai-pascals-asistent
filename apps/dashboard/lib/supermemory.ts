// Memory Interface - Abstraction Layer
// Allows switching between Supermemory and Supabase (Self-hosted)

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Define a common interface for memory providers
export interface MemoryProvider {
  addMemory(params: AddMemoryParams): Promise<any>;
  query(query: string, limit?: number): Promise<any[]>;
}

interface AddMemoryParams {
  content: string;
  containerTag?: string;
  metadata?: Record<string, any>;
}

// ---------------------------------------------------------
// 1. Supabase (Postgres) Provider - Cost Effective
// ---------------------------------------------------------
class SupabaseMemoryProvider implements MemoryProvider {
  private db: ReturnType<typeof drizzle<typeof schema>>;

  constructor() {
    const connectionString = process.env.POSTGRES_URL!;
    const client = postgres(connectionString);
    this.db = drizzle(client, { schema });
  }

  async addMemory({ content, containerTag, metadata }: AddMemoryParams) {
    // Insert into Supabase 'Knowledge' table
    const result = await this.db.insert(schema.knowledge).values({
      content,
      category: containerTag || 'general',
      tags: metadata?.tags || [],
      metadata: metadata || {},
      isActive: metadata?.is_active ?? true,
    }).returning();
    
    return result[0];
  }

  async query(query: string, limit: number = 5) {
    // TODO: Implement Full Text Search or Vector Search via pgvector here
    // For now, simple text match as fallback
    // In production, we should enable pgvector on Supabase
    return []; 
  }
}

// ---------------------------------------------------------
// 2. Supermemory Provider - Expensive but turnkey
// ---------------------------------------------------------
const SUPERMEMORY_API_URL = "https://supermemory.ai";

class SupermemoryProvider implements MemoryProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

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

      if (!response.ok) throw new Error(`Supermemory API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to add memory to Supermemory:", error);
      throw error;
    }
  }

  async query(query: string, limit: number = 5) {
    try {
      const response = await fetch(`${SUPERMEMORY_API_URL}/api/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${this.apiKey}` },
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      return [];
    }
  }
}

// ---------------------------------------------------------
// Factory / Singleton
// ---------------------------------------------------------
let memoryInstance: MemoryProvider | null = null;

export function getMemoryProvider(): MemoryProvider | null {
  if (memoryInstance) return memoryInstance;

  // STRATEGY: Prefer Supabase (Cost Effective) if configured, else fallback to Supermemory
  // Or use a flag like USE_SUPERMEMORY=true
  
  // 1. Check for Supabase
  if (process.env.POSTGRES_URL) {
    console.log("Using Supabase (Postgres) for Memory [Cost-Effective Mode]");
    memoryInstance = new SupabaseMemoryProvider();
    return memoryInstance;
  }

  // 2. Fallback to Supermemory
  const supermemoryKey = process.env.SUPERMEMORY_API_KEY;
  if (supermemoryKey) {
    console.log("Using Supermemory.ai for Memory");
    memoryInstance = new SupermemoryProvider(supermemoryKey);
    return memoryInstance;
  }

  console.warn("No memory provider configured (Missing POSTGRES_URL or SUPERMEMORY_API_KEY)");
  return null;
}

// Backwards compatibility for existing code calling getSupermemory
export const getSupermemory = getMemoryProvider;
