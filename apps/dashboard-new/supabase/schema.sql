-- ============================================================
-- NEXIFY AI - PERFEKTES BRAIN SYSTEM
-- Supabase PostgreSQL + pgvector Schema
-- ============================================================
-- Erstellt: 2026-01-10
-- Zweck: Live-Gedächtnis das NIEMALS vergisst
-- Features: Embeddings, Segmentierung, Realtime, Fehlerlernen
-- ============================================================

-- 1. EXTENSIONS AKTIVIEREN
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector;      -- pgvector für Embeddings
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- Trigram für Fuzzy-Search
CREATE EXTENSION IF NOT EXISTS unaccent;    -- Akzent-unabhängige Suche

-- 2. ENUM TYPES
-- ============================================================
CREATE TYPE memory_scope AS ENUM ('user', 'project', 'global', 'session');
CREATE TYPE memory_type AS ENUM (
  'conversation',      -- Chat-Nachrichten
  'knowledge',         -- Faktenwissen
  'preference',        -- User-Präferenzen
  'error_solution',    -- Fehler und Lösungen
  'learned_pattern',   -- Gelernte Muster
  'code_snippet',      -- Code-Beispiele
  'architecture',      -- Architektur-Entscheidungen
  'credential',        -- API Keys (verschlüsselt)
  'task',              -- Aufgaben/TODOs
  'relationship'       -- Beziehungen zwischen Entitäten
);
CREATE TYPE importance_level AS ENUM ('critical', 'high', 'medium', 'low', 'trivial');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system', 'tool');

-- 3. HAUPTTABELLEN
-- ============================================================

-- 3.1 MEMORIES - Das Herzstück des Brain
-- ============================================================
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Inhalt
  content TEXT NOT NULL,
  summary TEXT,                              -- KI-generierte Zusammenfassung
  embedding vector(1536),                    -- OpenAI ada-002 Embedding
  
  -- Klassifizierung
  scope memory_scope NOT NULL DEFAULT 'project',
  type memory_type NOT NULL DEFAULT 'knowledge',
  importance importance_level NOT NULL DEFAULT 'medium',
  
  -- Segmentierung
  project_id TEXT DEFAULT 'nexify-ai',       -- Projekt-Zuordnung
  user_id TEXT DEFAULT 'pascal',             -- User-Zuordnung
  session_id TEXT,                           -- Session-Zuordnung
  
  -- Metadaten
  tags TEXT[] DEFAULT '{}',                  -- Schlagwörter
  source TEXT,                               -- Woher kommt das Wissen?
  context JSONB DEFAULT '{}',                -- Zusätzlicher Kontext
  
  -- Beziehungen
  parent_id UUID REFERENCES memories(id),    -- Hierarchie
  related_ids UUID[] DEFAULT '{}',           -- Verknüpfte Memories
  
  -- Zeitstempel
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,                    -- Optional: Auto-Expire
  
  -- Metriken
  access_count INT DEFAULT 0,                -- Wie oft abgerufen?
  relevance_score FLOAT DEFAULT 0.5,         -- Berechnete Relevanz
  confidence FLOAT DEFAULT 1.0,              -- Wie sicher sind wir?
  
  -- Flags
  is_verified BOOLEAN DEFAULT FALSE,         -- Manuell verifiziert?
  is_pinned BOOLEAN DEFAULT FALSE,           -- Immer laden?
  is_archived BOOLEAN DEFAULT FALSE,         -- Archiviert?
  auto_load BOOLEAN DEFAULT FALSE            -- Zwangsladung?
);

-- 3.2 CONVERSATIONS - Chat-Verläufe
-- ============================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metadaten
  title TEXT,
  summary TEXT,
  
  -- Segmentierung
  project_id TEXT DEFAULT 'nexify-ai',
  user_id TEXT DEFAULT 'pascal',
  
  -- Zeitstempel
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metriken
  message_count INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  
  -- Flags
  is_archived BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE
);

-- 3.3 MESSAGES - Einzelne Nachrichten
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Inhalt
  role message_role NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  
  -- Metadaten
  model TEXT,                                -- Welches Modell?
  tokens_used INT,
  tool_calls JSONB,                          -- MCP Tool Calls
  
  -- Zeitstempel
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Sortierung
  sequence INT NOT NULL DEFAULT 0
);

-- 3.4 KNOWLEDGE_BASE - Strukturiertes Wissen
-- ============================================================
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Kategorisierung
  category TEXT NOT NULL,                    -- z.B. 'api', 'architecture', 'preferences'
  subcategory TEXT,
  
  -- Inhalt
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  
  -- Strukturierte Daten
  data JSONB DEFAULT '{}',                   -- Key-Value Paare
  
  -- Quelle
  source_type TEXT,                          -- 'manual', 'learned', 'imported'
  source_url TEXT,
  source_file TEXT,
  
  -- Versionierung
  version INT DEFAULT 1,
  previous_version_id UUID REFERENCES knowledge_base(id),
  
  -- Zeitstempel
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Flags
  is_active BOOLEAN DEFAULT TRUE,
  auto_load BOOLEAN DEFAULT FALSE            -- Zwangsladung?
);

-- 3.5 ERROR_SOLUTIONS - Fehler und deren Lösungen
-- ============================================================
CREATE TABLE error_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Fehler-Info
  error_type TEXT NOT NULL,                  -- z.B. 'TypeError', 'BuildError'
  error_message TEXT NOT NULL,
  error_context JSONB DEFAULT '{}',          -- Stack trace, file, line
  embedding vector(1536),
  
  -- Lösung
  solution TEXT NOT NULL,
  solution_steps JSONB,                      -- Schritt-für-Schritt
  
  -- Metadaten
  technology TEXT[],                         -- ['react', 'typescript', 'next.js']
  tags TEXT[] DEFAULT '{}',
  
  -- Statistiken
  times_encountered INT DEFAULT 1,
  times_solved INT DEFAULT 0,
  success_rate FLOAT DEFAULT 0,
  
  -- Zeitstempel
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_encountered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 LEARNED_PATTERNS - Gelernte Muster
-- ============================================================
CREATE TABLE learned_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pattern-Definition
  pattern_name TEXT NOT NULL,
  pattern_description TEXT NOT NULL,
  trigger_conditions JSONB,                  -- Wann aktivieren?
  
  -- Inhalt
  template TEXT,                             -- Code/Text Template
  example_input TEXT,
  example_output TEXT,
  embedding vector(1536),
  
  -- Kategorisierung
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Metriken
  usage_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  
  -- Zeitstempel
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 PROJECTS - Projekt-Metadaten
-- ============================================================
CREATE TABLE projects (
  id TEXT PRIMARY KEY,                       -- z.B. 'nexify-ai'
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pfade
  root_path TEXT,
  repo_url TEXT,
  
  -- Konfiguration
  config JSONB DEFAULT '{}',
  
  -- Statistiken
  memory_count INT DEFAULT 0,
  conversation_count INT DEFAULT 0,
  
  -- Zeitstempel
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 CONTEXT_SNAPSHOTS - Kontext-Snapshots für Sessions
-- ============================================================
CREATE TABLE context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referenz
  conversation_id UUID REFERENCES conversations(id),
  
  -- Snapshot
  loaded_memories UUID[],                    -- Welche Memories waren geladen?
  system_prompt TEXT,
  context_summary TEXT,
  
  -- Metadaten
  total_tokens INT,
  
  -- Zeitstempel
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9 EMBEDDINGS_QUEUE - Queue für Embedding-Generierung
-- ============================================================
CREATE TABLE embeddings_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referenz
  table_name TEXT NOT NULL,                  -- z.B. 'memories', 'messages'
  record_id UUID NOT NULL,
  content TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending',             -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  attempts INT DEFAULT 0,
  
  -- Zeitstempel
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- 4. INDEXES FÜR PERFORMANCE
-- ============================================================

-- Embedding-Suche (HNSW für schnelle Approximate Nearest Neighbor)
CREATE INDEX idx_memories_embedding ON memories 
  USING hnsw (embedding vector_cosine_ops) 
  WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_messages_embedding ON messages 
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_knowledge_embedding ON knowledge_base 
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_errors_embedding ON error_solutions 
  USING hnsw (embedding vector_cosine_ops);

-- Standard-Indexes
CREATE INDEX idx_memories_scope ON memories(scope);
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_project ON memories(project_id);
CREATE INDEX idx_memories_user ON memories(user_id);
CREATE INDEX idx_memories_auto_load ON memories(auto_load) WHERE auto_load = TRUE;
CREATE INDEX idx_memories_pinned ON memories(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_memories_tags ON memories USING GIN(tags);
CREATE INDEX idx_memories_created ON memories(created_at DESC);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_role ON messages(role);

CREATE INDEX idx_knowledge_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_auto_load ON knowledge_base(auto_load) WHERE auto_load = TRUE;

CREATE INDEX idx_errors_type ON error_solutions(error_type);
CREATE INDEX idx_errors_technology ON error_solutions USING GIN(technology);

-- Fulltext-Suche
CREATE INDEX idx_memories_content_fts ON memories 
  USING GIN(to_tsvector('german', content));

CREATE INDEX idx_knowledge_content_fts ON knowledge_base 
  USING GIN(to_tsvector('german', content));

-- 5. FUNKTIONEN
-- ============================================================

-- 5.1 Semantische Suche in Memories
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_scope memory_scope DEFAULT NULL,
  filter_type memory_type DEFAULT NULL,
  filter_project TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  summary TEXT,
  scope memory_scope,
  type memory_type,
  importance importance_level,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.summary,
    m.scope,
    m.type,
    m.importance,
    1 - (m.embedding <=> query_embedding) AS similarity,
    m.created_at
  FROM memories m
  WHERE 
    m.embedding IS NOT NULL
    AND m.is_archived = FALSE
    AND (filter_scope IS NULL OR m.scope = filter_scope)
    AND (filter_type IS NULL OR m.type = filter_type)
    AND (filter_project IS NULL OR m.project_id = filter_project)
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5.2 Zwangsladung - Alle auto_load Memories abrufen
CREATE OR REPLACE FUNCTION get_mandatory_context(
  p_project_id TEXT DEFAULT 'nexify-ai'
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  type memory_type,
  importance importance_level
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Pinned Memories
  SELECT m.id, m.content, m.type, m.importance
  FROM memories m
  WHERE (m.is_pinned = TRUE OR m.auto_load = TRUE)
    AND m.is_archived = FALSE
    AND (m.project_id = p_project_id OR m.scope = 'global')
  
  UNION ALL
  
  -- Auto-load Knowledge
  SELECT k.id, k.content, 'knowledge'::memory_type, 'high'::importance_level
  FROM knowledge_base k
  WHERE k.auto_load = TRUE AND k.is_active = TRUE
  
  ORDER BY importance DESC;
END;
$$;

-- 5.3 Ähnliche Fehler finden
CREATE OR REPLACE FUNCTION find_similar_errors(
  error_embedding vector(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  error_type TEXT,
  error_message TEXT,
  solution TEXT,
  similarity FLOAT,
  success_rate FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.error_type,
    e.error_message,
    e.solution,
    1 - (e.embedding <=> error_embedding) AS similarity,
    e.success_rate
  FROM error_solutions e
  WHERE e.embedding IS NOT NULL
  ORDER BY e.embedding <=> error_embedding
  LIMIT match_count;
END;
$$;

-- 5.4 Memory Zugriff tracken
CREATE OR REPLACE FUNCTION track_memory_access(memory_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE memories
  SET 
    access_count = access_count + 1,
    last_accessed_at = NOW(),
    relevance_score = LEAST(1.0, relevance_score + 0.01)
  WHERE id = memory_id;
END;
$$;

-- 5.5 Automatische Zusammenfassung bei langen Conversations
CREATE OR REPLACE FUNCTION summarize_old_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Wenn Conversation mehr als 50 Nachrichten hat
  IF (SELECT COUNT(*) FROM messages WHERE conversation_id = NEW.conversation_id) > 50 THEN
    -- Die ältesten 20 Nachrichten für Zusammenfassung markieren
    -- (Die eigentliche Zusammenfassung macht die KI)
    INSERT INTO embeddings_queue (table_name, record_id, content, status)
    SELECT 'conversation_summary', NEW.conversation_id, 
           string_agg(content, E'\n'), 'pending'
    FROM (
      SELECT content FROM messages 
      WHERE conversation_id = NEW.conversation_id 
      ORDER BY sequence LIMIT 20
    ) old_messages;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. TRIGGERS
-- ============================================================

-- Auto-Update updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER knowledge_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Queue Embedding-Generierung bei neuem Memory
CREATE OR REPLACE FUNCTION queue_embedding()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.embedding IS NULL THEN
    INSERT INTO embeddings_queue (table_name, record_id, content)
    VALUES (TG_TABLE_NAME, NEW.id, NEW.content);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memories_queue_embedding
  AFTER INSERT ON memories
  FOR EACH ROW EXECUTE FUNCTION queue_embedding();

CREATE TRIGGER messages_queue_embedding
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION queue_embedding();

-- Message Count Update
CREATE OR REPLACE FUNCTION update_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET message_count = (
    SELECT COUNT(*) FROM messages WHERE conversation_id = NEW.conversation_id
  )
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_count_update
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_message_count();

-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_solutions ENABLE ROW LEVEL SECURITY;

-- Policy für Memories: User sieht nur eigene + globale
CREATE POLICY memories_user_policy ON memories
  FOR ALL
  USING (
    scope = 'global' 
    OR user_id = current_setting('app.current_user_id', TRUE)
    OR project_id = current_setting('app.current_project_id', TRUE)
  );

-- Policy für Conversations
CREATE POLICY conversations_user_policy ON conversations
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', TRUE));

-- Policy für Messages (über Conversation)
CREATE POLICY messages_user_policy ON messages
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = current_setting('app.current_user_id', TRUE)
    )
  );

-- Knowledge ist für alle lesbar
CREATE POLICY knowledge_read_policy ON knowledge_base
  FOR SELECT USING (is_active = TRUE);

-- Error Solutions sind für alle lesbar
CREATE POLICY errors_read_policy ON error_solutions
  FOR SELECT USING (TRUE);

-- 8. REALTIME AKTIVIEREN
-- ============================================================

-- Für Live-Updates im Dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE memories;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 9. INITIAL DATA - Projekt anlegen
-- ============================================================

INSERT INTO projects (id, name, description, root_path, repo_url)
VALUES (
  'nexify-ai',
  'NeXify AI',
  'Pascals persönlicher KI-Assistent - Chat it. Automate it.',
  'C:\Users\pcour\OneDrive\pascals-assistent\pascals-aktiver-assistent-nichts-loeschen',
  'https://github.com/NeXifiyAI/nexifyai-pascals-asistent.git'
)
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW(),
  last_active_at = NOW();

-- 10. HILFSFUNKTIONEN FÜR BRAIN-LOADER
-- ============================================================

-- Kompletten Kontext für Chat laden
CREATE OR REPLACE FUNCTION load_brain_context(
  p_query TEXT,
  p_query_embedding vector(1536),
  p_project_id TEXT DEFAULT 'nexify-ai',
  p_max_tokens INT DEFAULT 4000
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
  mandatory_context TEXT;
  relevant_memories JSONB;
  recent_errors JSONB;
BEGIN
  -- 1. Zwangsladung (Pinned + Auto-load)
  SELECT jsonb_agg(jsonb_build_object(
    'id', id,
    'content', content,
    'type', type
  ))
  INTO result
  FROM get_mandatory_context(p_project_id);
  
  -- 2. Semantisch relevante Memories
  SELECT jsonb_agg(jsonb_build_object(
    'id', id,
    'content', content,
    'type', type,
    'similarity', similarity
  ))
  INTO relevant_memories
  FROM search_memories(p_query_embedding, 0.7, 10, NULL, NULL, p_project_id);
  
  -- 3. Kombinieren
  result := jsonb_build_object(
    'mandatory', result,
    'relevant', relevant_memories,
    'project_id', p_project_id,
    'loaded_at', NOW()
  );
  
  RETURN result;
END;
$$;

-- Memory hinzufügen (vereinfacht)
CREATE OR REPLACE FUNCTION add_memory(
  p_content TEXT,
  p_type memory_type DEFAULT 'knowledge',
  p_scope memory_scope DEFAULT 'project',
  p_importance importance_level DEFAULT 'medium',
  p_tags TEXT[] DEFAULT '{}',
  p_auto_load BOOLEAN DEFAULT FALSE,
  p_project_id TEXT DEFAULT 'nexify-ai'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO memories (content, type, scope, importance, tags, auto_load, project_id)
  VALUES (p_content, p_type, p_scope, p_importance, p_tags, p_auto_load, p_project_id)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- ============================================================
-- FERTIG! 
-- Dieses Schema bietet:
-- - Semantische Suche mit pgvector
-- - Zwangsladung für kritisches Wissen
-- - Segmentierung nach User/Projekt/Session
-- - Fehler-Tracking mit Lösungen
-- - Gelernte Muster
-- - Realtime Updates
-- - Row Level Security
-- - Automatische Embedding-Queue
-- ============================================================
