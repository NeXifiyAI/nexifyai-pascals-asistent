// ============================================================
// NEXIFY AI - SUPABASE BRAIN LOADER
// Zwangsladung, Semantische Suche, Live-Gedächtnis
// ============================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Types
export interface Memory {
  id: string;
  content: string;
  summary?: string;
  scope: "user" | "project" | "global" | "session";
  type:
    | "conversation"
    | "knowledge"
    | "preference"
    | "error_solution"
    | "learned_pattern"
    | "code_snippet"
    | "architecture"
    | "credential"
    | "task"
    | "relationship";
  importance: "critical" | "high" | "medium" | "low" | "trivial";
  tags: string[];
  auto_load: boolean;
  is_pinned: boolean;
  similarity?: number;
  created_at: string;
}

export interface BrainContext {
  mandatory: Memory[];
  relevant: Memory[];
  errors: ErrorSolution[];
  total_tokens_estimate: number;
  loaded_at: string;
}

export interface ErrorSolution {
  id: string;
  error_type: string;
  error_message: string;
  solution: string;
  similarity: number;
  success_rate: number;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  created_at: string;
}

// Supabase Client Singleton
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const url =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error("Supabase credentials not configured");
    }

    supabaseClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseClient;
}

// ============================================================
// BRAIN LOADER - Hauptklasse
// ============================================================

export class BrainLoader {
  private supabase: SupabaseClient;
  private projectId: string;
  private embeddingModel = "text-embedding-ada-002";

  constructor(projectId: string = "nexify-ai") {
    this.supabase = getSupabaseClient();
    this.projectId = projectId;
  }

  // -----------------------------------------------------------
  // ZWANGSLADUNG - Immer geladener Kontext
  // -----------------------------------------------------------
  async getMandatoryContext(): Promise<Memory[]> {
    const { data, error } = await this.supabase
      .from("memories")
      .select("*")
      .or("is_pinned.eq.true,auto_load.eq.true")
      .eq("is_archived", false)
      .or(`project_id.eq.${this.projectId},scope.eq.global`)
      .order("importance", { ascending: true }); // critical first

    if (error) {
      console.error("Error loading mandatory context:", error);
      return [];
    }

    // Auch Knowledge Base mit auto_load
    const { data: knowledge } = await this.supabase
      .from("knowledge_base")
      .select("id, content, category")
      .eq("auto_load", true)
      .eq("is_active", true);

    const knowledgeAsMemories: Memory[] = (knowledge || []).map((k) => ({
      id: k.id,
      content: k.content,
      scope: "project" as const,
      type: "knowledge" as const,
      importance: "high" as const,
      tags: [k.category],
      auto_load: true,
      is_pinned: false,
      created_at: new Date().toISOString(),
    }));

    return [...(data || []), ...knowledgeAsMemories];
  }

  // -----------------------------------------------------------
  // SEMANTISCHE SUCHE - Relevante Memories finden
  // -----------------------------------------------------------
  async searchMemories(
    queryEmbedding: number[],
    options: {
      threshold?: number;
      limit?: number;
      scope?: string;
      type?: string;
    } = {},
  ): Promise<Memory[]> {
    const { threshold = 0.7, limit = 10, scope, type } = options;

    const { data, error } = await this.supabase.rpc("search_memories", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_scope: scope || null,
      filter_type: type || null,
      filter_project: this.projectId,
    });

    if (error) {
      console.error("Error searching memories:", error);
      return [];
    }

    // Track access
    for (const memory of data || []) {
      this.trackAccess(memory.id);
    }

    return data || [];
  }

  // -----------------------------------------------------------
  // FEHLER-SUCHE - Ähnliche Fehler und Lösungen finden
  // -----------------------------------------------------------
  async findSimilarErrors(
    errorEmbedding: number[],
    limit = 5,
  ): Promise<ErrorSolution[]> {
    const { data, error } = await this.supabase.rpc("find_similar_errors", {
      error_embedding: errorEmbedding,
      match_count: limit,
    });

    if (error) {
      console.error("Error finding similar errors:", error);
      return [];
    }

    return data || [];
  }

  // -----------------------------------------------------------
  // KOMPLETTER BRAIN CONTEXT - Alles für einen Chat laden
  // -----------------------------------------------------------
  async loadBrainContext(
    query: string,
    queryEmbedding: number[],
    options: {
      maxTokens?: number;
      includeErrors?: boolean;
    } = {},
  ): Promise<BrainContext> {
    const { maxTokens = 4000, includeErrors = true } = options;

    // Parallel laden für Performance
    const [mandatory, relevant, errors] = await Promise.all([
      this.getMandatoryContext(),
      this.searchMemories(queryEmbedding, { limit: 10 }),
      includeErrors
        ? this.findSimilarErrors(queryEmbedding, 3)
        : Promise.resolve([]),
    ]);

    // Token-Schätzung (grob: 4 chars = 1 token)
    const estimateTokens = (items: { content: string }[]) =>
      items.reduce((sum, item) => sum + Math.ceil(item.content.length / 4), 0);

    const totalTokens = estimateTokens(mandatory) + estimateTokens(relevant);

    return {
      mandatory,
      relevant,
      errors,
      total_tokens_estimate: totalTokens,
      loaded_at: new Date().toISOString(),
    };
  }

  // -----------------------------------------------------------
  // MEMORY SPEICHERN
  // -----------------------------------------------------------
  async addMemory(
    content: string,
    options: {
      type?: Memory["type"];
      scope?: Memory["scope"];
      importance?: Memory["importance"];
      tags?: string[];
      autoLoad?: boolean;
      isPinned?: boolean;
      embedding?: number[];
    } = {},
  ): Promise<string | null> {
    const {
      type = "knowledge",
      scope = "project",
      importance = "medium",
      tags = [],
      autoLoad = false,
      isPinned = false,
      embedding,
    } = options;

    const { data, error } = await this.supabase
      .from("memories")
      .insert({
        content,
        type,
        scope,
        importance,
        tags,
        auto_load: autoLoad,
        is_pinned: isPinned,
        embedding,
        project_id: this.projectId,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error adding memory:", error);
      return null;
    }

    return data?.id || null;
  }

  // -----------------------------------------------------------
  // CONVERSATION MANAGEMENT
  // -----------------------------------------------------------
  async createConversation(title?: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("conversations")
      .insert({
        title,
        project_id: this.projectId,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    return data?.id || null;
  }

  async addMessage(
    conversationId: string,
    role: "user" | "assistant" | "system" | "tool",
    content: string,
    options: {
      model?: string;
      tokensUsed?: number;
      toolCalls?: unknown;
      embedding?: number[];
    } = {},
  ): Promise<string | null> {
    // Get next sequence number
    const { data: lastMsg } = await this.supabase
      .from("messages")
      .select("sequence")
      .eq("conversation_id", conversationId)
      .order("sequence", { ascending: false })
      .limit(1)
      .single();

    const sequence = (lastMsg?.sequence || 0) + 1;

    const { data, error } = await this.supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
        sequence,
        model: options.model,
        tokens_used: options.tokensUsed,
        tool_calls: options.toolCalls,
        embedding: options.embedding,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error adding message:", error);
      return null;
    }

    return data?.id || null;
  }

  async getConversationHistory(
    conversationId: string,
    limit = 50,
  ): Promise<ConversationMessage[]> {
    const { data, error } = await this.supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("sequence", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error getting conversation history:", error);
      return [];
    }

    return data || [];
  }

  // -----------------------------------------------------------
  // ERROR TRACKING - Fehler und Lösungen speichern
  // -----------------------------------------------------------
  async trackError(
    errorType: string,
    errorMessage: string,
    solution: string,
    options: {
      context?: Record<string, unknown>;
      technology?: string[];
      tags?: string[];
      embedding?: number[];
    } = {},
  ): Promise<string | null> {
    // Check if similar error exists
    if (options.embedding) {
      const similar = await this.findSimilarErrors(options.embedding, 1);

      if (similar.length > 0 && similar[0].similarity > 0.95) {
        // Update existing error
        const { error } = await this.supabase
          .from("error_solutions")
          .update({
            times_encountered: this.supabase.rpc("increment", { x: 1 }),
            last_encountered_at: new Date().toISOString(),
          })
          .eq("id", similar[0].id);

        if (!error) return similar[0].id;
      }
    }

    // Insert new error
    const { data, error } = await this.supabase
      .from("error_solutions")
      .insert({
        error_type: errorType,
        error_message: errorMessage,
        solution,
        error_context: options.context || {},
        technology: options.technology || [],
        tags: options.tags || [],
        embedding: options.embedding,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error tracking error:", error);
      return null;
    }

    return data?.id || null;
  }

  async markErrorSolved(errorId: string): Promise<void> {
    await this.supabase
      .from("error_solutions")
      .update({
        times_solved: this.supabase.rpc("increment", { x: 1 }),
      })
      .eq("id", errorId);
  }

  // -----------------------------------------------------------
  // LEARNED PATTERNS - Muster speichern
  // -----------------------------------------------------------
  async addPattern(
    name: string,
    description: string,
    options: {
      template?: string;
      exampleInput?: string;
      exampleOutput?: string;
      category?: string;
      tags?: string[];
      embedding?: number[];
    } = {},
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("learned_patterns")
      .insert({
        pattern_name: name,
        pattern_description: description,
        template: options.template,
        example_input: options.exampleInput,
        example_output: options.exampleOutput,
        category: options.category,
        tags: options.tags || [],
        embedding: options.embedding,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error adding pattern:", error);
      return null;
    }

    return data?.id || null;
  }

  // -----------------------------------------------------------
  // HELPER FUNCTIONS
  // -----------------------------------------------------------
  private async trackAccess(memoryId: string): Promise<void> {
    await this.supabase.rpc("track_memory_access", { memory_id: memoryId });
  }

  // Format context for System Prompt
  formatContextForPrompt(context: BrainContext): string {
    const parts: string[] = [];

    // Mandatory context (always first)
    if (context.mandatory.length > 0) {
      parts.push("## KERNWISSEN (Immer aktiv)");
      context.mandatory.forEach((m) => {
        parts.push(`[${m.type.toUpperCase()}] ${m.content}`);
      });
    }

    // Relevant context
    if (context.relevant.length > 0) {
      parts.push("\n## RELEVANTER KONTEXT");
      context.relevant.forEach((m) => {
        const sim = m.similarity ? ` (${Math.round(m.similarity * 100)}%)` : "";
        parts.push(`[${m.type}${sim}] ${m.content}`);
      });
    }

    // Error solutions
    if (context.errors.length > 0) {
      parts.push("\n## BEKANNTE FEHLER & LÖSUNGEN");
      context.errors.forEach((e) => {
        parts.push(`Fehler: ${e.error_type} - ${e.error_message}`);
        parts.push(`Lösung: ${e.solution}`);
      });
    }

    return parts.join("\n");
  }
}

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================

export function subscribeToMemories(
  callback: (payload: { new: Memory; old: Memory }) => void,
): () => void {
  const supabase = getSupabaseClient();

  const subscription = supabase
    .channel("memories_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "memories" },
      (payload) => callback(payload as any),
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
}

export function subscribeToConversation(
  conversationId: string,
  callback: (message: ConversationMessage) => void,
): () => void {
  const supabase = getSupabaseClient();

  const subscription = supabase
    .channel(`conversation_${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => callback(payload.new as ConversationMessage),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

// ============================================================
// SINGLETON EXPORT
// ============================================================

let brainLoader: BrainLoader | null = null;

export function getBrainLoader(projectId?: string): BrainLoader {
  if (!brainLoader || (projectId && projectId !== "nexify-ai")) {
    brainLoader = new BrainLoader(projectId);
  }
  return brainLoader;
}

export default BrainLoader;
