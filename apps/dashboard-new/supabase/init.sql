CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$ BEGIN
  CREATE TYPE memory_scope AS ENUM ('user', 'project', 'global', 'session');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE memory_type AS ENUM (
    'conversation', 'knowledge', 'preference', 'error_solution',
    'learned_pattern', 'code_snippet', 'architecture', 'credential', 'task', 'relationship'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE importance_level AS ENUM ('critical', 'high', 'medium', 'low', 'trivial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system', 'tool');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  summary TEXT,
  embedding vector(1536),
  scope memory_scope NOT NULL DEFAULT 'project',
  type memory_type NOT NULL DEFAULT 'knowledge',
  importance importance_level NOT NULL DEFAULT 'medium',
  project_id TEXT DEFAULT 'nexify-ai',
  user_id TEXT DEFAULT 'pascal',
  session_id TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  context JSONB DEFAULT '{}',
  parent_id UUID REFERENCES memories(id),
  related_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  access_count INT DEFAULT 0,
  relevance_score FLOAT DEFAULT 0.5,
  confidence FLOAT DEFAULT 1.0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  auto_load BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  summary TEXT,
  project_id TEXT DEFAULT 'nexify-ai',
  user_id TEXT DEFAULT 'pascal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  model TEXT,
  tokens_used INT,
  tool_calls JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sequence INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  subcategory TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  data JSONB DEFAULT '{}',
  source_type TEXT,
  source_url TEXT,
  source_file TEXT,
  version INT DEFAULT 1,
  previous_version_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  auto_load BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS error_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_context JSONB DEFAULT '{}',
  embedding vector(1536),
  solution TEXT NOT NULL,
  solution_steps JSONB,
  technology TEXT[],
  tags TEXT[] DEFAULT '{}',
  times_encountered INT DEFAULT 1,
  times_solved INT DEFAULT 0,
  success_rate FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_encountered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learned_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name TEXT NOT NULL,
  pattern_description TEXT NOT NULL,
  trigger_conditions JSONB,
  template TEXT,
  example_input TEXT,
  example_output TEXT,
  embedding vector(1536),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  usage_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  root_path TEXT,
  repo_url TEXT,
  config JSONB DEFAULT '{}',
  memory_count INT DEFAULT 0,
  conversation_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_memories_scope ON memories(scope);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_project ON memories(project_id);
CREATE INDEX IF NOT EXISTS idx_memories_auto_load ON memories(auto_load) WHERE auto_load = TRUE;
CREATE INDEX IF NOT EXISTS idx_memories_pinned ON memories(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE OR REPLACE FUNCTION search_memories(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_scope memory_scope DEFAULT NULL,
  filter_type memory_type DEFAULT NULL,
  filter_project TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID, content TEXT, summary TEXT, scope memory_scope,
  type memory_type, importance importance_level, similarity FLOAT, created_at TIMESTAMPTZ
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.content, m.summary, m.scope, m.type, m.importance,
    1 - (m.embedding <=> query_embedding) AS similarity, m.created_at
  FROM memories m
  WHERE m.embedding IS NOT NULL AND m.is_archived = FALSE
    AND (filter_scope IS NULL OR m.scope = filter_scope)
    AND (filter_type IS NULL OR m.type = filter_type)
    AND (filter_project IS NULL OR m.project_id = filter_project)
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_mandatory_context(p_project_id TEXT DEFAULT 'nexify-ai')
RETURNS TABLE (id UUID, content TEXT, type memory_type, importance importance_level)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.content, m.type, m.importance
  FROM memories m
  WHERE (m.is_pinned = TRUE OR m.auto_load = TRUE)
    AND m.is_archived = FALSE
    AND (m.project_id = p_project_id OR m.scope = 'global')
  ORDER BY m.importance;
END;
$$;

CREATE OR REPLACE FUNCTION track_memory_access(memory_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE memories SET access_count = access_count + 1,
    last_accessed_at = NOW(), relevance_score = LEAST(1.0, relevance_score + 0.01)
  WHERE id = memory_id;
END;
$$;

INSERT INTO projects (id, name, description, repo_url)
VALUES ('nexify-ai', 'NeXify AI', 'Pascals persoenlicher KI-Assistent', 'https://github.com/NeXifiyAI/nexifyai-pascals-asistent.git')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW(), last_active_at = NOW();

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON memories;
CREATE POLICY "Service role full access" ON memories FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON conversations;
CREATE POLICY "Service role full access" ON conversations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON messages;
CREATE POLICY "Service role full access" ON messages FOR ALL USING (true) WITH CHECK (true);
