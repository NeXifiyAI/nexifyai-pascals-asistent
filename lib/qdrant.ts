import { QdrantClient } from "@qdrant/js-client-rest";

if (!process.env.QDRANT_URL) {
  throw new Error("QDRANT_URL is not defined");
}

if (!process.env.QDRANT_API_KEY) {
  throw new Error("QDRANT_API_KEY is not defined");
}

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export const COLLECTIONS = {
  MEMORY: "brain_memory",
};

export type MemoryPoint = {
  id: string;
  payload: {
    content: string;
    timestamp: number;
    type: "fact" | "code" | "preference" | "conversation";
    is_active: boolean; // TRUE = Current/Live, FALSE = Historical/Archived
    superseded_by?: string; // ID of the new truth if this point is outdated
    source: "user" | "system" | "external";
  };
  vector: number[];
};

