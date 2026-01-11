-- ============================================================
-- NEXIFY AI - COMPLETE SUPABASE SCHEMA
-- Version: 2.0 (Business Suite + Queue System)
-- ============================================================
-- 
-- USAGE:
-- 1. Go to: https://supabase.com/dashboard/project/cwebcfgdraghzeqgfsty/sql/new
-- 2. Paste this entire file
-- 3. Click "Run"
--
-- ============================================================

-- ==========================================================
-- EXTENSIONS
-- ==========================================================
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================================
-- ENUMS
-- ==========================================================
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

-- NEW: Task Queue Status
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'queued', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NEW: Task Priority
DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'normal', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NEW: Client Status
DO $$ BEGIN
  CREATE TYPE client_status AS ENUM ('lead', 'prospect', 'active', 'inactive', 'churned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NEW: Project Status
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('inquiry', 'proposal', 'approved', 'in_progress', 'review', 'completed', 'maintenance', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NEW: Invoice Status
DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==========================================================
-- BRAIN TABLES (existing)
-- ==========================================================
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

-- ==========================================================
-- BUSINESS TABLES (NEW)
-- ==========================================================

-- Company Info (NeXify AI)
CREATE TABLE IF NOT EXISTS company (
  id TEXT PRIMARY KEY DEFAULT 'nexify-ai',
  name TEXT NOT NULL DEFAULT 'NeXify AI',
  legal_name TEXT DEFAULT 'NeXify AI',
  tagline TEXT DEFAULT 'Chat it. Automate it.',
  email TEXT,
  phone TEXT,
  website TEXT DEFAULT 'https://nexify-automate.com',
  -- Address
  street TEXT,
  zip TEXT,
  city TEXT,
  country TEXT DEFAULT 'Deutschland',
  -- Legal
  vat_id TEXT,  -- USt-IdNr.
  tax_id TEXT,  -- Steuernummer
  registry_court TEXT,  -- Handelsregister
  registry_number TEXT,
  -- Bank
  bank_name TEXT,
  iban TEXT,
  bic TEXT,
  -- Settings
  invoice_prefix TEXT DEFAULT 'NX',
  invoice_counter INT DEFAULT 1,
  offer_prefix TEXT DEFAULT 'AG',
  offer_counter INT DEFAULT 1,
  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT DEFAULT '#06b6d4',
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients (Kunden)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Basic Info
  company_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  -- Address
  street TEXT,
  zip TEXT,
  city TEXT,
  country TEXT DEFAULT 'Deutschland',
  -- Business
  vat_id TEXT,
  status client_status NOT NULL DEFAULT 'lead',
  source TEXT,  -- How they found us
  -- Billing
  payment_terms INT DEFAULT 14,  -- Days
  hourly_rate DECIMAL(10,2),
  -- Notes
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_contact_at TIMESTAMPTZ
);

-- Client Projects
CREATE TABLE IF NOT EXISTS client_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'inquiry',
  -- Dates
  start_date DATE,
  due_date DATE,
  completed_date DATE,
  -- Budget
  budget_type TEXT DEFAULT 'fixed',  -- 'fixed', 'hourly', 'retainer'
  budget_amount DECIMAL(10,2),
  hours_estimated DECIMAL(10,2),
  hours_spent DECIMAL(10,2) DEFAULT 0,
  -- Tech Stack
  tech_stack TEXT[] DEFAULT '{}',
  repo_url TEXT,
  staging_url TEXT,
  production_url TEXT,
  -- Starter Kit used
  starter_kit TEXT,
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Offers/Proposals (Angebote)
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES client_projects(id),
  -- Number
  offer_number TEXT NOT NULL,  -- AG-2026-001
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]',  -- [{name, description, quantity, unit_price, total}]
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 19,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  -- Dates
  valid_until DATE,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  -- Status
  status TEXT DEFAULT 'draft',  -- 'draft', 'sent', 'accepted', 'rejected', 'expired'
  -- Meta
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices (Rechnungen)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES client_projects(id),
  offer_id UUID REFERENCES offers(id),
  -- Number
  invoice_number TEXT NOT NULL,  -- NX-2026-001
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]',  -- [{name, description, quantity, unit_price, total}]
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 19,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  -- Status
  status invoice_status NOT NULL DEFAULT 'draft',
  -- Payment
  payment_method TEXT,
  payment_reference TEXT,
  -- Meta
  notes TEXT,
  footer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- TASK QUEUE TABLES (NEW)
-- ==========================================================

-- Task Queue
CREATE TABLE IF NOT EXISTS task_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Task Info
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,  -- 'code_review', 'documentation', 'bug_fix', 'feature', 'deployment', etc.
  -- Priority & Status
  priority task_priority NOT NULL DEFAULT 'normal',
  status task_status NOT NULL DEFAULT 'pending',
  -- Assignment
  agent_type TEXT,  -- 'coder', 'reviewer', 'documenter', 'tester', 'deployer'
  assigned_at TIMESTAMPTZ,
  -- Context
  project_id UUID REFERENCES client_projects(id),
  related_memory_ids UUID[] DEFAULT '{}',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  -- Execution
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  -- Dependencies
  depends_on UUID[] DEFAULT '{}',  -- Other tasks that must complete first
  -- Meta
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent Execution Logs
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES task_queue(id) ON DELETE CASCADE,
  -- Agent Info
  agent_type TEXT NOT NULL,
  agent_model TEXT,  -- 'gpt-4', 'deepseek', etc.
  -- Execution
  action TEXT NOT NULL,
  input JSONB,
  output JSONB,
  tokens_used INT,
  duration_ms INT,
  -- Status
  success BOOLEAN DEFAULT TRUE,
  error TEXT,
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- TEMPLATES & STARTER KITS
-- ==========================================================

-- Document Templates
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Info
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- 'legal', 'invoice', 'offer', 'email', 'contract'
  subcategory TEXT,
  -- Content
  title_template TEXT,
  content_template TEXT NOT NULL,  -- With {{variables}}
  variables JSONB DEFAULT '[]',  -- [{name, type, default, required}]
  -- Meta
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Design System Tokens
CREATE TABLE IF NOT EXISTS design_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Token Info
  category TEXT NOT NULL,  -- 'color', 'typography', 'spacing', 'shadow', 'radius'
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  css_variable TEXT,  -- --nexify-color-primary
  -- Description
  description TEXT,
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category, name)
);

-- Starter Kits
CREATE TABLE IF NOT EXISTS starter_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,  -- 'saas', 'agency', 'ecommerce', 'blog'
  -- Tech
  tech_stack TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  -- Source
  repo_url TEXT,
  demo_url TEXT,
  -- Pricing
  is_free BOOLEAN DEFAULT TRUE,
  price DECIMAL(10,2),
  -- Meta
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- INTERNAL PROJECTS TABLE (extended)
-- ==========================================================
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

-- ==========================================================
-- INDEXES
-- ==========================================================

-- Memory Indexes
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_memories_scope ON memories(scope);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_project ON memories(project_id);
CREATE INDEX IF NOT EXISTS idx_memories_auto_load ON memories(auto_load) WHERE auto_load = TRUE;
CREATE INDEX IF NOT EXISTS idx_memories_pinned ON memories(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Business Indexes
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_client_projects_client ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON client_projects(status);
CREATE INDEX IF NOT EXISTS idx_offers_client ON offers(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Queue Indexes
CREATE INDEX IF NOT EXISTS idx_task_queue_status ON task_queue(status);
CREATE INDEX IF NOT EXISTS idx_task_queue_priority ON task_queue(priority);
CREATE INDEX IF NOT EXISTS idx_task_queue_type ON task_queue(type);
CREATE INDEX IF NOT EXISTS idx_task_queue_pending ON task_queue(status, priority) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_agent_logs_task ON agent_logs(task_id);

-- ==========================================================
-- FUNCTIONS
-- ==========================================================

-- Search memories (existing)
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

-- Get mandatory context (existing)
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

-- Track memory access (existing)
CREATE OR REPLACE FUNCTION track_memory_access(memory_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE memories SET access_count = access_count + 1,
    last_accessed_at = NOW(), relevance_score = LEAST(1.0, relevance_score + 0.01)
  WHERE id = memory_id;
END;
$$;

-- NEW: Get next task from queue
CREATE OR REPLACE FUNCTION get_next_task(p_agent_type TEXT DEFAULT NULL)
RETURNS task_queue
LANGUAGE plpgsql AS $$
DECLARE
  v_task task_queue;
BEGIN
  SELECT * INTO v_task
  FROM task_queue
  WHERE status = 'pending'
    AND (p_agent_type IS NULL OR agent_type = p_agent_type)
    AND (depends_on = '{}' OR NOT EXISTS (
      SELECT 1 FROM task_queue t2
      WHERE t2.id = ANY(task_queue.depends_on)
        AND t2.status NOT IN ('completed', 'cancelled')
    ))
  ORDER BY
    CASE priority
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'normal' THEN 3
      WHEN 'low' THEN 4
    END,
    created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF v_task.id IS NOT NULL THEN
    UPDATE task_queue
    SET status = 'processing', started_at = NOW(), updated_at = NOW()
    WHERE id = v_task.id;
  END IF;
  
  RETURN v_task;
END;
$$;

-- NEW: Complete task
CREATE OR REPLACE FUNCTION complete_task(
  p_task_id UUID,
  p_output JSONB DEFAULT '{}'
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE task_queue
  SET status = 'completed',
      completed_at = NOW(),
      output_data = p_output,
      updated_at = NOW()
  WHERE id = p_task_id;
END;
$$;

-- NEW: Fail task
CREATE OR REPLACE FUNCTION fail_task(
  p_task_id UUID,
  p_error TEXT
)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_retry_count INT;
  v_max_retries INT;
BEGIN
  SELECT retry_count, max_retries INTO v_retry_count, v_max_retries
  FROM task_queue WHERE id = p_task_id;
  
  IF v_retry_count < v_max_retries THEN
    UPDATE task_queue
    SET status = 'pending',
        retry_count = retry_count + 1,
        error = p_error,
        updated_at = NOW()
    WHERE id = p_task_id;
  ELSE
    UPDATE task_queue
    SET status = 'failed',
        error = p_error,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_task_id;
  END IF;
END;
$$;

-- NEW: Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_prefix TEXT;
  v_counter INT;
  v_year TEXT;
BEGIN
  SELECT invoice_prefix, invoice_counter INTO v_prefix, v_counter
  FROM company WHERE id = 'nexify-ai';
  
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  UPDATE company SET invoice_counter = invoice_counter + 1, updated_at = NOW()
  WHERE id = 'nexify-ai';
  
  RETURN v_prefix || '-' || v_year || '-' || LPAD(v_counter::TEXT, 3, '0');
END;
$$;

-- NEW: Generate offer number
CREATE OR REPLACE FUNCTION generate_offer_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v_prefix TEXT;
  v_counter INT;
  v_year TEXT;
BEGIN
  SELECT offer_prefix, offer_counter INTO v_prefix, v_counter
  FROM company WHERE id = 'nexify-ai';
  
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  UPDATE company SET offer_counter = offer_counter + 1, updated_at = NOW()
  WHERE id = 'nexify-ai';
  
  RETURN v_prefix || '-' || v_year || '-' || LPAD(v_counter::TEXT, 3, '0');
END;
$$;

-- ==========================================================
-- ROW LEVEL SECURITY
-- ==========================================================

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON memories;
CREATE POLICY "Service role full access" ON memories FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON conversations;
CREATE POLICY "Service role full access" ON conversations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON messages;
CREATE POLICY "Service role full access" ON messages FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON clients;
CREATE POLICY "Service role full access" ON clients FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON client_projects;
CREATE POLICY "Service role full access" ON client_projects FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON offers;
CREATE POLICY "Service role full access" ON offers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON invoices;
CREATE POLICY "Service role full access" ON invoices FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE task_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON task_queue;
CREATE POLICY "Service role full access" ON task_queue FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON agent_logs;
CREATE POLICY "Service role full access" ON agent_logs FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- INITIAL DATA
-- ==========================================================

-- NeXify AI Project
INSERT INTO projects (id, name, description, repo_url)
VALUES ('nexify-ai', 'NeXify AI', 'Pascals persoenlicher KI-Assistent', 'https://github.com/NeXifiyAI/nexifyai-pascals-asistent.git')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW(), last_active_at = NOW();

-- Company Data (Pascal needs to fill this)
INSERT INTO company (
  id, name, legal_name, tagline, email, website
) VALUES (
  'nexify-ai',
  'NeXify AI',
  'NeXify AI',
  'Chat it. Automate it.',
  'p.courbois@icloud.com',
  'https://nexify-automate.com'
) ON CONFLICT (id) DO NOTHING;

-- Default Design Tokens
INSERT INTO design_tokens (category, name, value, css_variable) VALUES
  ('color', 'primary', '#0ea5e9', '--nexify-color-primary'),
  ('color', 'primary-dark', '#0284c7', '--nexify-color-primary-dark'),
  ('color', 'secondary', '#06b6d4', '--nexify-color-secondary'),
  ('color', 'accent', '#8b5cf6', '--nexify-color-accent'),
  ('color', 'success', '#22c55e', '--nexify-color-success'),
  ('color', 'warning', '#f59e0b', '--nexify-color-warning'),
  ('color', 'error', '#ef4444', '--nexify-color-error'),
  ('color', 'background', '#0f172a', '--nexify-color-background'),
  ('color', 'surface', '#1e293b', '--nexify-color-surface'),
  ('color', 'text', '#f8fafc', '--nexify-color-text'),
  ('typography', 'font-family', '"Inter", system-ui, sans-serif', '--nexify-font-family'),
  ('typography', 'font-size-base', '16px', '--nexify-font-size-base'),
  ('spacing', 'unit', '4px', '--nexify-spacing-unit'),
  ('radius', 'default', '8px', '--nexify-radius-default'),
  ('shadow', 'default', '0 4px 6px -1px rgb(0 0 0 / 0.1)', '--nexify-shadow-default')
ON CONFLICT (category, name) DO NOTHING;

-- Default Document Templates
INSERT INTO document_templates (name, category, content_template, variables) VALUES
(
  'Standard-AGB',
  'legal',
  E'# Allgemeine Geschäftsbedingungen\n\n## §1 Geltungsbereich\n\nDiese AGB gelten für alle Verträge zwischen {{company_name}} und dem Auftraggeber.\n\n## §2 Vertragsschluss\n\n...',
  '[{"name": "company_name", "type": "string", "required": true}]'
),
(
  'Datenschutzerklärung',
  'legal',
  E'# Datenschutzerklärung\n\n## 1. Verantwortlicher\n\n{{company_name}}\n{{street}}\n{{zip}} {{city}}\n\n...',
  '[{"name": "company_name", "type": "string", "required": true}, {"name": "street", "type": "string"}, {"name": "zip", "type": "string"}, {"name": "city", "type": "string"}]'
),
(
  'Impressum',
  'legal',
  E'# Impressum\n\n**Angaben gemäß § 5 TMG:**\n\n{{company_name}}\n{{street}}\n{{zip}} {{city}}\n\n**Vertreten durch:**\n{{representative}}\n\n**Kontakt:**\nTelefon: {{phone}}\nE-Mail: {{email}}\n\n**Umsatzsteuer-ID:**\n{{vat_id}}',
  '[{"name": "company_name", "type": "string", "required": true}, {"name": "street", "type": "string"}, {"name": "zip", "type": "string"}, {"name": "city", "type": "string"}, {"name": "representative", "type": "string"}, {"name": "phone", "type": "string"}, {"name": "email", "type": "string"}, {"name": "vat_id", "type": "string"}]'
)
ON CONFLICT DO NOTHING;

-- Default Starter Kits
INSERT INTO starter_kits (name, slug, description, category, tech_stack, features, is_free) VALUES
(
  'Next.js SaaS Starter',
  'nextjs-saas',
  'Complete SaaS boilerplate with auth, billing, dashboard',
  'saas',
  ARRAY['Next.js', 'TypeScript', 'Tailwind', 'Supabase', 'Stripe'],
  ARRAY['Authentication', 'Subscription Billing', 'Admin Dashboard', 'API Routes', 'Email Templates'],
  true
),
(
  'Agency Website',
  'nextjs-agency',
  'Modern agency website with portfolio and contact',
  'agency',
  ARRAY['Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'],
  ARRAY['Portfolio', 'Services Pages', 'Contact Form', 'Blog', 'SEO Optimized'],
  true
),
(
  'E-Commerce Starter',
  'nextjs-ecommerce',
  'Full e-commerce solution with cart and checkout',
  'ecommerce',
  ARRAY['Next.js', 'TypeScript', 'Tailwind', 'Stripe', 'Supabase'],
  ARRAY['Product Catalog', 'Shopping Cart', 'Checkout', 'Order Management', 'Inventory'],
  true
)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================================
-- DONE!
-- ==========================================================
-- Schema Version: 2.0
-- Last Updated: 2026-01-11
-- ==========================================================
