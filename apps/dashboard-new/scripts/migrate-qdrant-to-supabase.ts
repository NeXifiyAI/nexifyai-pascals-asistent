// ============================================================
// NEXIFY AI - QDRANT TO SUPABASE MIGRATION
// Migriert alle 57.000+ Embeddings von Qdrant zu Supabase
// ============================================================

import { QdrantClient } from "@qdrant/js-client-rest";
import { createClient } from "@supabase/supabase-js";

// Configuration
const BATCH_SIZE = 100;
const COLLECTION_NAME = "brain_memory";

interface QdrantPoint {
  id: string | number;
  vector: number[];
  payload: {
    content?: string;
    type?: string;
    scope?: string;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

async function migrate() {
  console.log("🚀 Starting Qdrant to Supabase migration...");

  // Initialize clients
  const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
  });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Get collection info
  const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);
  const totalPoints = collectionInfo.points_count || 0;
  console.log(`📊 Found ${totalPoints} points in Qdrant`);

  let offset: string | number | undefined = undefined;
  let migratedCount = 0;
  let errorCount = 0;

  while (true) {
    // Fetch batch from Qdrant
    const response = await qdrant.scroll(COLLECTION_NAME, {
      limit: BATCH_SIZE,
      offset,
      with_payload: true,
      with_vector: true,
    });

    const points = response.points as QdrantPoint[];

    if (points.length === 0) {
      break;
    }

    // Transform and insert to Supabase
    const memories = points.map((point) => ({
      content: point.payload.content || JSON.stringify(point.payload),
      embedding: point.vector,
      type: mapType(point.payload.type),
      scope: mapScope(point.payload.scope),
      importance: "medium",
      project_id: "nexify-ai",
      user_id: "pascal",
      tags: extractTags(point.payload),
      context: point.payload.metadata || {},
      source: "qdrant_migration",
    }));

    const { error } = await supabase.from("memories").insert(memories);

    if (error) {
      console.error(`❌ Error inserting batch:`, error.message);
      errorCount += points.length;
    } else {
      migratedCount += points.length;
      console.log(
        `✅ Migrated ${migratedCount}/${totalPoints} (${Math.round((migratedCount / totalPoints) * 100)}%)`,
      );
    }

    // Update offset for next batch
    offset = response.next_page_offset;
    if (!offset) break;
  }

  console.log("\n🎉 Migration complete!");
  console.log(`   ✅ Migrated: ${migratedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

function mapType(type?: string): string {
  const typeMap: Record<string, string> = {
    fact: "knowledge",
    conversation: "conversation",
    preference: "preference",
    error: "error_solution",
    pattern: "learned_pattern",
    code: "code_snippet",
    architecture: "architecture",
  };
  return typeMap[type || ""] || "knowledge";
}

function mapScope(scope?: string): string {
  const scopeMap: Record<string, string> = {
    user: "user",
    project: "project",
    global: "global",
    session: "session",
  };
  return scopeMap[scope || ""] || "project";
}

function extractTags(payload: Record<string, unknown>): string[] {
  const tags: string[] = [];

  if (payload.category) tags.push(String(payload.category));
  if (payload.technology) {
    if (Array.isArray(payload.technology)) {
      tags.push(...payload.technology.map(String));
    } else {
      tags.push(String(payload.technology));
    }
  }
  if (payload.tags && Array.isArray(payload.tags)) {
    tags.push(...payload.tags.map(String));
  }

  return [...new Set(tags)]; // Unique tags
}

// Run migration
migrate().catch(console.error);
