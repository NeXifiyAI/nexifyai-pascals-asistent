import { QdrantClient } from "@qdrant/js-client-rest";

// Initialisiere Qdrant Client
const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "brain_memory"; // Production Collection aus dem alten Dashboard

interface BrainResult {
  content: string;
  score: number;
  metadata: any;
}

export async function loadBrainContext(
  query: string,
  limit: number = 5,
): Promise<string> {
  try {
    if (!process.env.QDRANT_URL || !process.env.QDRANT_API_KEY) {
      console.warn("Brain: Qdrant Credentials fehlen.");
      return "";
    }

    // 1. Embedding generieren (über OpenAI API direkt, da wir kein lokales Model haben)
    // Wir nutzen hierfür fetch direkt an OpenAI Embeddings API, um Dependencies klein zu halten
    // Oder besser: Wir nutzen die ai-sdk Helfer wenn möglich.
    // Aber da wir hier im Backend sind, nutzen wir einfach fetch.

    const embeddingResponse = await fetch(
      "https://api.openai.com/v1/embeddings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input: query,
          model: "text-embedding-3-small", // Standard für Qdrant meistens
        }),
      },
    );

    if (!embeddingResponse.ok) {
      throw new Error(
        `OpenAI Embedding Error: ${embeddingResponse.statusText}`,
      );
    }

    const embeddingData = await embeddingResponse.json();
    const vector = embeddingData.data[0].embedding;

    // 2. Suche in Qdrant
    const searchResult = await client.search(COLLECTION_NAME, {
      vector: vector,
      limit: limit,
      with_payload: true,
    });

    // 3. Ergebnisse formatieren
    const context = searchResult
      .filter((hit: any) => hit.score > 0.7) // Nur relevante Treffer
      .map((hit: any) => {
        const content =
          hit.payload?.content ||
          hit.payload?.text ||
          JSON.stringify(hit.payload);
        return `- ${content} (Relevanz: ${Math.round(hit.score * 100)}%)`;
      })
      .join("\n");

    if (context.length > 0) {
      console.log(
        `Brain: ${searchResult.length} Treffer gefunden für "${query}"`,
      );
    } else {
      console.log(`Brain: Keine relevanten Treffer für "${query}"`);
    }

    return context;
  } catch (error) {
    console.error("Brain Error:", error);
    return ""; // Fallback: Kein Kontext bei Fehler
  }
}
