// ============================================================
// NEXIFY AI - SUPABASE DATABASE TYPES
// Auto-generated from schema.sql
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MemoryScope = "user" | "project" | "global" | "session";
export type MemoryType =
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
export type ImportanceLevel =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "trivial";
export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface Database {
  public: {
    Tables: {
      memories: {
        Row: {
          id: string;
          content: string;
          summary: string | null;
          embedding: number[] | null;
          scope: MemoryScope;
          type: MemoryType;
          importance: ImportanceLevel;
          project_id: string;
          user_id: string;
          session_id: string | null;
          tags: string[];
          source: string | null;
          context: Json;
          parent_id: string | null;
          related_ids: string[];
          created_at: string;
          updated_at: string;
          last_accessed_at: string;
          expires_at: string | null;
          access_count: number;
          relevance_score: number;
          confidence: number;
          is_verified: boolean;
          is_pinned: boolean;
          is_archived: boolean;
          auto_load: boolean;
        };
        Insert: {
          id?: string;
          content: string;
          summary?: string | null;
          embedding?: number[] | null;
          scope?: MemoryScope;
          type?: MemoryType;
          importance?: ImportanceLevel;
          project_id?: string;
          user_id?: string;
          session_id?: string | null;
          tags?: string[];
          source?: string | null;
          context?: Json;
          parent_id?: string | null;
          related_ids?: string[];
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string;
          expires_at?: string | null;
          access_count?: number;
          relevance_score?: number;
          confidence?: number;
          is_verified?: boolean;
          is_pinned?: boolean;
          is_archived?: boolean;
          auto_load?: boolean;
        };
        Update: {
          id?: string;
          content?: string;
          summary?: string | null;
          embedding?: number[] | null;
          scope?: MemoryScope;
          type?: MemoryType;
          importance?: ImportanceLevel;
          project_id?: string;
          user_id?: string;
          session_id?: string | null;
          tags?: string[];
          source?: string | null;
          context?: Json;
          parent_id?: string | null;
          related_ids?: string[];
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string;
          expires_at?: string | null;
          access_count?: number;
          relevance_score?: number;
          confidence?: number;
          is_verified?: boolean;
          is_pinned?: boolean;
          is_archived?: boolean;
          auto_load?: boolean;
        };
      };
      conversations: {
        Row: {
          id: string;
          title: string | null;
          summary: string | null;
          project_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          message_count: number;
          total_tokens: number;
          is_archived: boolean;
          is_starred: boolean;
        };
        Insert: {
          id?: string;
          title?: string | null;
          summary?: string | null;
          project_id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          message_count?: number;
          total_tokens?: number;
          is_archived?: boolean;
          is_starred?: boolean;
        };
        Update: {
          id?: string;
          title?: string | null;
          summary?: string | null;
          project_id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          message_count?: number;
          total_tokens?: number;
          is_archived?: boolean;
          is_starred?: boolean;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          embedding: number[] | null;
          model: string | null;
          tokens_used: number | null;
          tool_calls: Json | null;
          created_at: string;
          sequence: number;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          embedding?: number[] | null;
          model?: string | null;
          tokens_used?: number | null;
          tool_calls?: Json | null;
          created_at?: string;
          sequence?: number;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: MessageRole;
          content?: string;
          embedding?: number[] | null;
          model?: string | null;
          tokens_used?: number | null;
          tool_calls?: Json | null;
          created_at?: string;
          sequence?: number;
        };
      };
      knowledge_base: {
        Row: {
          id: string;
          category: string;
          subcategory: string | null;
          title: string;
          content: string;
          embedding: number[] | null;
          data: Json;
          source_type: string | null;
          source_url: string | null;
          source_file: string | null;
          version: number;
          previous_version_id: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          auto_load: boolean;
        };
        Insert: {
          id?: string;
          category: string;
          subcategory?: string | null;
          title: string;
          content: string;
          embedding?: number[] | null;
          data?: Json;
          source_type?: string | null;
          source_url?: string | null;
          source_file?: string | null;
          version?: number;
          previous_version_id?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          auto_load?: boolean;
        };
        Update: {
          id?: string;
          category?: string;
          subcategory?: string | null;
          title?: string;
          content?: string;
          embedding?: number[] | null;
          data?: Json;
          source_type?: string | null;
          source_url?: string | null;
          source_file?: string | null;
          version?: number;
          previous_version_id?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          auto_load?: boolean;
        };
      };
      error_solutions: {
        Row: {
          id: string;
          error_type: string;
          error_message: string;
          error_context: Json;
          embedding: number[] | null;
          solution: string;
          solution_steps: Json | null;
          technology: string[];
          tags: string[];
          times_encountered: number;
          times_solved: number;
          success_rate: number;
          created_at: string;
          updated_at: string;
          last_encountered_at: string;
        };
        Insert: {
          id?: string;
          error_type: string;
          error_message: string;
          error_context?: Json;
          embedding?: number[] | null;
          solution: string;
          solution_steps?: Json | null;
          technology?: string[];
          tags?: string[];
          times_encountered?: number;
          times_solved?: number;
          success_rate?: number;
          created_at?: string;
          updated_at?: string;
          last_encountered_at?: string;
        };
        Update: {
          id?: string;
          error_type?: string;
          error_message?: string;
          error_context?: Json;
          embedding?: number[] | null;
          solution?: string;
          solution_steps?: Json | null;
          technology?: string[];
          tags?: string[];
          times_encountered?: number;
          times_solved?: number;
          success_rate?: number;
          created_at?: string;
          updated_at?: string;
          last_encountered_at?: string;
        };
      };
      learned_patterns: {
        Row: {
          id: string;
          pattern_name: string;
          pattern_description: string;
          trigger_conditions: Json | null;
          template: string | null;
          example_input: string | null;
          example_output: string | null;
          embedding: number[] | null;
          category: string | null;
          tags: string[];
          usage_count: number;
          success_count: number;
          failure_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pattern_name: string;
          pattern_description: string;
          trigger_conditions?: Json | null;
          template?: string | null;
          example_input?: string | null;
          example_output?: string | null;
          embedding?: number[] | null;
          category?: string | null;
          tags?: string[];
          usage_count?: number;
          success_count?: number;
          failure_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pattern_name?: string;
          pattern_description?: string;
          trigger_conditions?: Json | null;
          template?: string | null;
          example_input?: string | null;
          example_output?: string | null;
          embedding?: number[] | null;
          category?: string | null;
          tags?: string[];
          usage_count?: number;
          success_count?: number;
          failure_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          root_path: string | null;
          repo_url: string | null;
          config: Json;
          memory_count: number;
          conversation_count: number;
          created_at: string;
          updated_at: string;
          last_active_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          root_path?: string | null;
          repo_url?: string | null;
          config?: Json;
          memory_count?: number;
          conversation_count?: number;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          root_path?: string | null;
          repo_url?: string | null;
          config?: Json;
          memory_count?: number;
          conversation_count?: number;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string;
        };
      };
      context_snapshots: {
        Row: {
          id: string;
          conversation_id: string | null;
          loaded_memories: string[];
          system_prompt: string | null;
          context_summary: string | null;
          total_tokens: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id?: string | null;
          loaded_memories?: string[];
          system_prompt?: string | null;
          context_summary?: string | null;
          total_tokens?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string | null;
          loaded_memories?: string[];
          system_prompt?: string | null;
          context_summary?: string | null;
          total_tokens?: number | null;
          created_at?: string;
        };
      };
      embeddings_queue: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          content: string;
          status: string;
          error_message: string | null;
          attempts: number;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          content: string;
          status?: string;
          error_message?: string | null;
          attempts?: number;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          content?: string;
          status?: string;
          error_message?: string | null;
          attempts?: number;
          created_at?: string;
          processed_at?: string | null;
        };
      };
    };
    Functions: {
      search_memories: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
          filter_scope?: MemoryScope | null;
          filter_type?: MemoryType | null;
          filter_project?: string | null;
        };
        Returns: {
          id: string;
          content: string;
          summary: string | null;
          scope: MemoryScope;
          type: MemoryType;
          importance: ImportanceLevel;
          similarity: number;
          created_at: string;
        }[];
      };
      get_mandatory_context: {
        Args: {
          p_project_id?: string;
        };
        Returns: {
          id: string;
          content: string;
          type: MemoryType;
          importance: ImportanceLevel;
        }[];
      };
      find_similar_errors: {
        Args: {
          error_embedding: number[];
          match_count?: number;
        };
        Returns: {
          id: string;
          error_type: string;
          error_message: string;
          solution: string;
          similarity: number;
          success_rate: number;
        }[];
      };
      track_memory_access: {
        Args: {
          memory_id: string;
        };
        Returns: void;
      };
      add_memory: {
        Args: {
          p_content: string;
          p_type?: MemoryType;
          p_scope?: MemoryScope;
          p_importance?: ImportanceLevel;
          p_tags?: string[];
          p_auto_load?: boolean;
          p_project_id?: string;
        };
        Returns: string;
      };
      load_brain_context: {
        Args: {
          p_query: string;
          p_query_embedding: number[];
          p_project_id?: string;
          p_max_tokens?: number;
        };
        Returns: Json;
      };
    };
  };
}
