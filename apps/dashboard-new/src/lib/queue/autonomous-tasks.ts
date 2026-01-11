/**
 * ============================================================
 * NEXIFY AI - AUTONOMOUS TASK SYSTEM
 * Lädt alle Aufgaben aus dem Masterplan in die Task Queue
 * ============================================================
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Types
interface Task {
  name: string;
  description: string;
  type: string;
  priority: "urgent" | "high" | "normal" | "low";
  agent_type?: string;
  input_data?: Record<string, unknown>;
  depends_on?: string[];
  phase: number;
}

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

// ============================================================
// COMPLETE TASK LIST FROM MASTERPLAN
// ============================================================

export const MASTERPLAN_TASKS: Task[] = [
  // ============================================================
  // PHASE 1: INFRASTRUCTURE & FOUNDATION
  // ============================================================
  {
    name: "VPS Docker Stack deployen",
    description:
      "SSH auf 72.62.152.47, docker-compose.yml hochladen und 'docker-compose up -d' ausführen",
    type: "deployment",
    priority: "urgent",
    agent_type: "deployer",
    phase: 1,
    input_data: {
      host: "72.62.152.47",
      user: "root",
      files: [
        "infrastructure/vps/docker-compose.yml",
        "infrastructure/vps/.env",
      ],
    },
  },
  {
    name: "Supabase Schema V2 ausführen",
    description:
      "schema-v2.sql in Supabase SQL Editor ausführen und alle Tabellen verifizieren",
    type: "database",
    priority: "urgent",
    agent_type: "deployer",
    phase: 1,
    input_data: {
      supabase_url:
        "https://supabase.com/dashboard/project/cwebcfgdraghzeqgfsty/sql/new",
      schema_file: "apps/dashboard-new/supabase/schema-v2.sql",
    },
  },
  {
    name: "DNS Subdomains erstellen",
    description:
      "Subdomains für app, n8n, meet, code, crm, billing, pm bei Domain-Provider erstellen",
    type: "infrastructure",
    priority: "urgent",
    agent_type: "deployer",
    phase: 1,
    input_data: {
      domain: "nexify-automate.com",
      subdomains: ["app", "n8n", "meet", "code", "crm", "billing", "pm"],
      target_ip: "72.62.152.47",
    },
  },
  {
    name: "Jitsi Meet deployen",
    description:
      "Jitsi Docker auf VPS installieren, SSL via Traefik, Branding konfigurieren",
    type: "deployment",
    priority: "high",
    agent_type: "deployer",
    phase: 1,
    input_data: {
      domain: "meet.nexify-automate.com",
      branding: {
        logo: "/logo.svg",
        primary_color: "#2563eb",
        app_name: "NeXify Meet",
      },
    },
  },
  {
    name: "Firewall konfigurieren",
    description:
      "UFW Setup: SSH 22, HTTP 80, HTTPS 443, n8n 5678, Jitsi 10000/udp",
    type: "infrastructure",
    priority: "high",
    agent_type: "deployer",
    phase: 1,
  },

  // ============================================================
  // PHASE 2: COMMUNICATION HUB
  // ============================================================
  {
    name: "Email SMTP Client implementieren",
    description:
      "Nodemailer Setup mit SMTP Config, createTransport, sendMail Funktion",
    type: "feature",
    priority: "urgent",
    agent_type: "coder",
    phase: 2,
    input_data: {
      file: "src/lib/email/smtp-client.ts",
      dependencies: ["nodemailer", "@types/nodemailer"],
    },
  },
  {
    name: "Email IMAP Client implementieren",
    description: "IMAP Client für Email-Empfang, Inbox-Sync, Threading",
    type: "feature",
    priority: "urgent",
    agent_type: "coder",
    phase: 2,
    input_data: {
      file: "src/lib/email/imap-client.ts",
      dependencies: ["imap", "@types/imap", "mailparser", "@types/mailparser"],
    },
  },
  {
    name: "React Email Templates erstellen",
    description:
      "Email Templates: Welcome, Invoice, Notification, Password Reset",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 2,
    input_data: {
      folder: "src/emails/",
      templates: [
        "welcome.tsx",
        "invoice.tsx",
        "notification.tsx",
        "password-reset.tsx",
      ],
      dependencies: ["@react-email/components"],
    },
  },
  {
    name: "Email Send API Route erstellen",
    description: "POST /api/email/send - Email mit Template senden",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 2,
    input_data: {
      file: "src/app/api/email/send/route.ts",
    },
  },
  {
    name: "Email Inbox API Route erstellen",
    description: "GET /api/email/inbox - Emails aus IMAP abrufen",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 2,
    input_data: {
      file: "src/app/api/email/inbox/route.ts",
    },
  },
  {
    name: "Email Compose Modal Component",
    description:
      "Modal mit To, Subject, Body (Rich Editor), Attachments, Send Button",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 2,
    input_data: {
      file: "src/components/email/compose-modal.tsx",
    },
  },
  {
    name: "Telnyx Account Setup",
    description:
      "Telnyx Account erstellen, DE Telefonnummer kaufen, SIP Credentials holen",
    type: "setup",
    priority: "high",
    agent_type: "deployer",
    phase: 2,
    input_data: {
      provider: "telnyx",
      country: "DE",
    },
  },
  {
    name: "VoIP SIP.js Client implementieren",
    description:
      "SIP.js Browser Client für WebRTC Calls, UserAgent, Inviter, Registerer",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 2,
    input_data: {
      file: "src/lib/voip/sip-client.ts",
      dependencies: ["sip.js"],
    },
  },
  {
    name: "VoIP Dialer Component",
    description: "Dialer UI mit Nummerneingabe, Kontakt-Auswahl, Call Button",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 2,
    input_data: {
      file: "src/components/voip/dialer.tsx",
    },
  },
  {
    name: "VoIP Call Modal Component",
    description:
      "Aktiver Call UI mit Timer, Mute, Hold, Transfer, Hangup Buttons",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 2,
    input_data: {
      file: "src/components/voip/call-modal.tsx",
    },
  },
  {
    name: "Video Meeting Room Component",
    description: "Jitsi IFrame API Integration für embedded Meetings",
    type: "feature",
    priority: "normal",
    agent_type: "coder",
    phase: 2,
    input_data: {
      file: "src/components/video/meeting-room.tsx",
    },
  },

  // ============================================================
  // PHASE 3: BUSINESS SUITE
  // ============================================================
  {
    name: "Twenty CRM deployen",
    description: "Twenty Docker auf VPS oder Cloud Setup, API Key generieren",
    type: "deployment",
    priority: "urgent",
    agent_type: "deployer",
    phase: 3,
    input_data: {
      domain: "crm.nexify-automate.com",
      docker_image: "twentycrm/twenty:latest",
    },
  },
  {
    name: "Twenty API Client implementieren",
    description:
      "REST/GraphQL Client für Twenty CRM mit allen CRUD Operationen",
    type: "feature",
    priority: "urgent",
    agent_type: "coder",
    phase: 3,
    input_data: {
      file: "src/lib/crm/twenty-client.ts",
      endpoints: ["companies", "people", "opportunities", "tasks", "notes"],
    },
  },
  {
    name: "CRM Dashboard Pages erstellen",
    description:
      "Pages: /dashboard/crm, /dashboard/crm/contacts, /dashboard/crm/companies, /dashboard/crm/deals",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 3,
    input_data: {
      files: [
        "src/app/dashboard/crm/page.tsx",
        "src/app/dashboard/crm/contacts/page.tsx",
        "src/app/dashboard/crm/companies/page.tsx",
        "src/app/dashboard/crm/deals/page.tsx",
      ],
    },
  },
  {
    name: "CRM Contact Card Component",
    description:
      "Kontakt Card mit Avatar, Info, Quick Actions (Email, Call, Meeting)",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 3,
    input_data: {
      file: "src/components/crm/contact-card.tsx",
    },
  },
  {
    name: "Invoice Ninja deployen",
    description:
      "Invoice Ninja Docker auf VPS, MariaDB Setup, API Key generieren",
    type: "deployment",
    priority: "urgent",
    agent_type: "deployer",
    phase: 3,
    input_data: {
      domain: "billing.nexify-automate.com",
      docker_image: "invoiceninja/invoiceninja:latest",
    },
  },
  {
    name: "Invoice Ninja API Client implementieren",
    description: "REST API Client für Invoices, Quotes, Clients, Payments",
    type: "feature",
    priority: "urgent",
    agent_type: "coder",
    phase: 3,
    input_data: {
      file: "src/lib/invoicing/invoice-ninja-client.ts",
      api_version: "v5",
    },
  },
  {
    name: "Invoicing Dashboard Pages erstellen",
    description:
      "Pages: /dashboard/invoicing, /dashboard/invoicing/create, /dashboard/invoicing/[id]",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 3,
    input_data: {
      files: [
        "src/app/dashboard/invoicing/page.tsx",
        "src/app/dashboard/invoicing/create/page.tsx",
        "src/app/dashboard/invoicing/[id]/page.tsx",
      ],
    },
  },
  {
    name: "Plane PM deployen",
    description: "Plane Docker auf VPS oder Cloud Setup",
    type: "deployment",
    priority: "high",
    agent_type: "deployer",
    phase: 3,
    input_data: {
      domain: "pm.nexify-automate.com",
    },
  },
  {
    name: "Plane API Client implementieren",
    description: "REST API Client für Projects, Work Items, Cycles, Modules",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 3,
    input_data: {
      file: "src/lib/pm/plane-client.ts",
    },
  },
  {
    name: "PM Dashboard Pages erstellen",
    description: "Pages: /dashboard/projects, /dashboard/projects/[id]",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 3,
    input_data: {
      files: [
        "src/app/dashboard/projects/page.tsx",
        "src/app/dashboard/projects/[id]/page.tsx",
      ],
    },
  },
  {
    name: "Kanban Board Component",
    description: "Drag & Drop Kanban Board für Tasks mit Columns und Cards",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 3,
    input_data: {
      file: "src/components/pm/kanban-board.tsx",
      dependencies: ["@dnd-kit/core", "@dnd-kit/sortable"],
    },
  },

  // ============================================================
  // PHASE 4: AI AGENTS & AUTOMATION
  // ============================================================
  {
    name: "Task Queue Worker implementieren",
    description:
      "Supabase Realtime Listener für task_queue, Task Processing Logic",
    type: "feature",
    priority: "urgent",
    agent_type: "coder",
    phase: 4,
    input_data: {
      file: "src/lib/queue/worker.ts",
    },
  },
  {
    name: "Code Agent implementieren",
    description:
      "AI Agent für Code Review, Bug Fix, Feature Implementation mit MCP Tools",
    type: "feature",
    priority: "urgent",
    agent_type: "coder",
    phase: 4,
    input_data: {
      file: "src/lib/agents/code-agent.ts",
      capabilities: ["code_review", "bug_fix", "feature", "documentation"],
    },
  },
  {
    name: "Content Agent implementieren",
    description: "AI Agent für Blog Posts, Social Media, Newsletter",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 4,
    input_data: {
      file: "src/lib/agents/content-agent.ts",
      capabilities: ["blog", "social_media", "newsletter", "seo_content"],
    },
  },
  {
    name: "Design Agent implementieren",
    description: "AI Agent für UI Components, Graphics, Logos via Hugging Face",
    type: "feature",
    priority: "normal",
    agent_type: "coder",
    phase: 4,
    input_data: {
      file: "src/lib/agents/design-agent.ts",
      capabilities: ["ui_components", "graphics", "logos"],
    },
  },
  {
    name: "SEO Agent implementieren",
    description: "AI Agent für Keyword Research, Meta Tags, Content Analysis",
    type: "feature",
    priority: "normal",
    agent_type: "coder",
    phase: 4,
    input_data: {
      file: "src/lib/agents/seo-agent.ts",
      capabilities: ["keywords", "meta_tags", "content_analysis"],
    },
  },
  {
    name: "Legal Agent implementieren",
    description: "AI Agent für AGB, Datenschutz, Impressum mit Templates",
    type: "feature",
    priority: "normal",
    agent_type: "coder",
    phase: 4,
    input_data: {
      file: "src/lib/agents/legal-agent.ts",
      capabilities: ["agb", "datenschutz", "impressum", "vertraege"],
    },
  },
  {
    name: "Support Agent implementieren",
    description: "AI Agent für FAQ, Troubleshooting, Ticket Creation",
    type: "feature",
    priority: "normal",
    agent_type: "coder",
    phase: 4,
    input_data: {
      file: "src/lib/agents/support-agent.ts",
      capabilities: ["faq", "troubleshooting", "tickets"],
    },
  },
  {
    name: "n8n Workflow: New Lead Notification",
    description: "Workflow: CRM Webhook -> Email Notification bei neuem Lead",
    type: "automation",
    priority: "high",
    agent_type: "deployer",
    phase: 4,
    input_data: {
      workflow_name: "new-lead-notification",
      trigger: "webhook",
    },
  },
  {
    name: "n8n Workflow: Invoice Reminder",
    description:
      "Workflow: Scheduled -> Check Overdue Invoices -> Send Reminder Email",
    type: "automation",
    priority: "high",
    agent_type: "deployer",
    phase: 4,
    input_data: {
      workflow_name: "invoice-reminder",
      trigger: "cron",
      schedule: "0 9 * * *",
    },
  },
  {
    name: "n8n Workflow: AI Task Processor",
    description:
      "Workflow: Task Queue Webhook -> Route to Agent -> Update Status",
    type: "automation",
    priority: "urgent",
    agent_type: "deployer",
    phase: 4,
    input_data: {
      workflow_name: "ai-task-processor",
      trigger: "webhook",
    },
  },

  // ============================================================
  // PHASE 5: CLIENT PORTAL & MARKETING
  // ============================================================
  {
    name: "Marketing Landing Page erstellen",
    description: "Hero Section, Features, Services, Pricing, CTA, Footer",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 5,
    input_data: {
      file: "src/app/(marketing)/page.tsx",
      sections: ["hero", "features", "services", "pricing", "cta"],
    },
  },
  {
    name: "Services Pages erstellen",
    description: "Service Overview + Detail Pages für alle AI Services",
    type: "feature",
    priority: "high",
    agent_type: "coder",
    phase: 5,
    input_data: {
      files: [
        "src/app/(marketing)/services/page.tsx",
        "src/app/(marketing)/services/[slug]/page.tsx",
      ],
    },
  },
  {
    name: "Pricing Page erstellen",
    description: "Pricing Table mit allen Paketen und Features",
    type: "feature",
    priority: "normal",
    agent_type: "coder",
    phase: 5,
    input_data: {
      file: "src/app/(marketing)/pricing/page.tsx",
    },
  },
  {
    name: "Legal Pages erstellen",
    description: "Impressum, Datenschutz, AGB aus Templates generieren",
    type: "feature",
    priority: "normal",
    agent_type: "coder",
    phase: 5,
    input_data: {
      files: [
        "src/app/(marketing)/legal/impressum/page.tsx",
        "src/app/(marketing)/legal/datenschutz/page.tsx",
        "src/app/(marketing)/legal/agb/page.tsx",
      ],
    },
  },
  {
    name: "Client Portal implementieren",
    description: "Portal mit Login, Projekte, Rechnungen, Dokumente, Support",
    type: "feature",
    priority: "normal",
    agent_type: "coder",
    phase: 5,
    input_data: {
      files: [
        "src/app/(portal)/portal/page.tsx",
        "src/app/(portal)/portal/projects/page.tsx",
        "src/app/(portal)/portal/invoices/page.tsx",
        "src/app/(portal)/portal/support/page.tsx",
      ],
    },
  },
  {
    name: "Logo und Branding Assets erstellen",
    description: "Logo SVG, Favicon, OG Image, Email Header, PDF Header",
    type: "design",
    priority: "high",
    agent_type: "designer",
    phase: 5,
    input_data: {
      assets: ["logo.svg", "favicon.ico", "og-image.png", "email-header.png"],
      colors: { primary: "#2563eb", gold: "#d4a00a" },
    },
  },

  // ============================================================
  // PHASE 6: TESTING & GO-LIVE
  // ============================================================
  {
    name: "Unit Tests schreiben",
    description: "Tests für API Routes, Utilities, Components",
    type: "testing",
    priority: "high",
    agent_type: "tester",
    phase: 6,
    input_data: {
      test_framework: "vitest",
      coverage_target: 80,
    },
  },
  {
    name: "E2E Tests schreiben",
    description: "Playwright Tests für Critical User Flows",
    type: "testing",
    priority: "high",
    agent_type: "tester",
    phase: 6,
    input_data: {
      test_framework: "playwright",
      flows: ["login", "send_email", "create_invoice", "start_call"],
    },
  },
  {
    name: "CI/CD Pipeline erstellen",
    description: "GitHub Actions: Test -> Build -> Deploy Vercel -> Deploy VPS",
    type: "infrastructure",
    priority: "high",
    agent_type: "deployer",
    phase: 6,
    input_data: {
      file: ".github/workflows/deploy.yml",
    },
  },
  {
    name: "Performance Optimization",
    description: "Lighthouse Audit, Bundle Size, Image Optimization, Caching",
    type: "optimization",
    priority: "normal",
    agent_type: "coder",
    phase: 6,
    input_data: {
      lighthouse_target: 90,
    },
  },
  {
    name: "Go-Live Deployment",
    description:
      "DNS umstellen, Production Deploy, Smoke Tests, Monitoring aktivieren",
    type: "deployment",
    priority: "urgent",
    agent_type: "deployer",
    phase: 6,
    input_data: {
      checklist: [
        "ssl_active",
        "backups_configured",
        "monitoring_active",
        "seo_meta_tags",
        "analytics_setup",
      ],
    },
  },
];

// ============================================================
// FUNCTIONS
// ============================================================

/**
 * Load all tasks from Masterplan into Supabase task_queue
 */
export async function loadAllTasksToQueue(): Promise<{
  success: boolean;
  loaded: number;
  errors: string[];
}> {
  const db = getSupabase();
  const errors: string[] = [];
  let loaded = 0;

  // Group tasks by phase for dependency tracking
  const taskIdMap = new Map<string, string>();

  for (const task of MASTERPLAN_TASKS) {
    try {
      // Check if task already exists
      const { data: existing } = await db
        .from("task_queue")
        .select("id")
        .eq("name", task.name)
        .single();

      if (existing) {
        taskIdMap.set(task.name, existing.id);
        continue; // Skip existing tasks
      }

      // Insert new task
      const { data, error } = await db
        .from("task_queue")
        .insert({
          name: task.name,
          description: task.description,
          type: task.type,
          priority: task.priority,
          agent_type: task.agent_type || null,
          input_data: {
            ...task.input_data,
            phase: task.phase,
          },
          status: "pending",
          created_by: "masterplan_loader",
        })
        .select("id")
        .single();

      if (error) {
        errors.push(`${task.name}: ${error.message}`);
      } else if (data) {
        taskIdMap.set(task.name, data.id);
        loaded++;
      }
    } catch (err) {
      errors.push(`${task.name}: ${String(err)}`);
    }
  }

  return { success: errors.length === 0, loaded, errors };
}

/**
 * Get next pending task for autonomous execution
 */
export async function getNextTask(agentType?: string): Promise<Task | null> {
  const db = getSupabase();

  const { data, error } = await db.rpc("get_next_task", {
    p_agent_type: agentType || null,
  });

  if (error || !data) {
    return null;
  }

  return data as unknown as Task;
}

/**
 * Mark task as completed
 */
export async function completeTask(
  taskId: string,
  output: Record<string, unknown>,
): Promise<boolean> {
  const db = getSupabase();

  const { error } = await db.rpc("complete_task", {
    p_task_id: taskId,
    p_output: output,
  });

  return !error;
}

/**
 * Mark task as failed
 */
export async function failTask(
  taskId: string,
  errorMsg: string,
): Promise<boolean> {
  const db = getSupabase();

  const { error } = await db.rpc("fail_task", {
    p_task_id: taskId,
    p_error: errorMsg,
  });

  return !error;
}

/**
 * Get task statistics
 */
export async function getTaskStats(): Promise<{
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> {
  const db = getSupabase();

  const { data } = await db
    .from("task_queue")
    .select("status")
    .order("created_at", { ascending: false });

  const stats = {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  if (data) {
    stats.total = data.length;
    for (const task of data) {
      switch (task.status) {
        case "pending":
          stats.pending++;
          break;
        case "processing":
          stats.processing++;
          break;
        case "completed":
          stats.completed++;
          break;
        case "failed":
          stats.failed++;
          break;
      }
    }
  }

  return stats;
}

/**
 * Subscribe to task updates (for real-time UI)
 */
export function subscribeToTasks(
  callback: (payload: { new: Task; old: Task }) => void,
): () => void {
  const db = getSupabase();

  const subscription = db
    .channel("task_queue_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "task_queue",
      },
      (payload) => {
        callback(payload as unknown as { new: Task; old: Task });
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// ============================================================
// AUTONOMOUS WORKER
// ============================================================

/**
 * Autonomous task processor - runs continuously
 */
export async function runAutonomousWorker(
  processTask: (task: Task) => Promise<Record<string, unknown>>,
  options: {
    agentType?: string;
    pollInterval?: number;
    maxConcurrent?: number;
  } = {},
): Promise<void> {
  const { agentType, pollInterval = 5000, maxConcurrent = 1 } = options;
  let running = 0;

  console.log(
    `[AutonomousWorker] Starting worker for agent: ${agentType || "all"}`,
  );

  const processNext = async () => {
    if (running >= maxConcurrent) return;

    const task = await getNextTask(agentType);
    if (!task) return;

    running++;
    console.log(`[AutonomousWorker] Processing: ${task.name}`);

    try {
      const result = await processTask(task);
      await completeTask((task as unknown as { id: string }).id, result);
      console.log(`[AutonomousWorker] Completed: ${task.name}`);
    } catch (err) {
      await failTask((task as unknown as { id: string }).id, String(err));
      console.error(`[AutonomousWorker] Failed: ${task.name}`, err);
    } finally {
      running--;
    }
  };

  // Poll for new tasks
  setInterval(processNext, pollInterval);

  // Initial run
  processNext();
}
