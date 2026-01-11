# NEXIFY AI - VOLLSTAENDIGER UMSETZUNGSPLAN

## Version 1.0 | Stand: 11. Januar 2026

> **ZIEL:** Vollstaendige AI-gestuetzte Agentur-Plattform mit Kommunikation, Verwaltung, Betreuung und durchgaengigem CI

---

# TEIL 1: GAP-ANALYSE - WAS FEHLT NOCH

## AKTUELLER STAND (Bereits vorhanden)

| Komponente              | Status | Dateien                                   |
| ----------------------- | ------ | ----------------------------------------- |
| Dashboard UI            | OK     | `apps/dashboard-new/`                     |
| Chat mit DeepSeek       | OK     | `src/app/api/chat/route.ts`               |
| Brain System (Supabase) | OK     | `src/lib/brain/supabase-loader.ts`        |
| Brain System (Qdrant)   | OK     | `src/lib/brain/loader.ts`                 |
| Auth Middleware         | OK     | `src/middleware.ts`                       |
| Premium Design System   | OK     | `src/lib/design-tokens.ts`, `globals.css` |
| VPS Docker Config       | OK     | `infrastructure/vps/docker-compose.yml`   |
| Supabase Schema V2      | OK     | `supabase/schema-v2.sql`                  |

## FEHLENDE KOMPONENTEN

### KOMMUNIKATION

| Feature           | Status | Loesung                  |
| ----------------- | ------ | ------------------------ |
| E-Mail Senden     | FEHLT  | Nodemailer + React Email |
| E-Mail Empfangen  | FEHLT  | IMAP Client              |
| E-Mail UI (Popup) | FEHLT  | Modal mit Editor         |
| VoIP Telefonie    | FEHLT  | Telnyx + SIP.js          |
| Video-Calls       | FEHLT  | Jitsi Meet (Self-Hosted) |
| SMS               | FEHLT  | Telnyx SMS API           |

### BUSINESS SUITE

| Feature            | Status | Loesung               |
| ------------------ | ------ | --------------------- |
| CRM Integration    | FEHLT  | Twenty CRM API        |
| Invoicing          | FEHLT  | Invoice Ninja API     |
| Project Management | FEHLT  | Plane API             |
| Kunden-Portal      | FEHLT  | Eigene Implementation |

### AI AGENTS

| Feature       | Status    | Loesung               |
| ------------- | --------- | --------------------- |
| Code Agent    | TEILWEISE | DeepSeek + MCP Tools  |
| Design Agent  | FEHLT     | Hugging Face + Penpot |
| Content Agent | FEHLT     | DeepSeek + Templates  |
| SEO Agent     | FEHLT     | DeepSeek + Web Search |
| Legal Agent   | FEHLT     | Templates + RAG       |
| Support Agent | FEHLT     | RAG + Chatbot         |

### AUTOMATION

| Feature           | Status | Loesung        |
| ----------------- | ------ | -------------- |
| Task Queue Worker | FEHLT  | Supabase + n8n |
| Workflow Engine   | FEHLT  | n8n Workflows  |
| Scheduled Jobs    | FEHLT  | n8n Cron       |
| Webhooks          | FEHLT  | API Routes     |

### CI/BRANDING

| Feature         | Status | Loesung              |
| --------------- | ------ | -------------------- |
| Logo            | FEHLT  | Design erstellen     |
| Favicon         | FEHLT  | Von Logo ableiten    |
| OG Images       | FEHLT  | Dynamisch generieren |
| Email Templates | FEHLT  | React Email          |
| PDF Templates   | FEHLT  | React-PDF            |
| Video Branding  | FEHLT  | Jitsi Customization  |

---

# TEIL 2: ARCHITEKTUR-UEBERSICHT

```
+------------------------------------------------------------------+
|                        NEXIFY AI PLATFORM                         |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------+  +--------------------------------+   |
|  |   VERCEL (Frontend)    |  |    HOSTINGER VPS (Backend)     |   |
|  +------------------------+  +--------------------------------+   |
|  | - Next.js Dashboard    |  | - n8n (Workflows)              |   |
|  | - Marketing Pages      |  | - Jitsi Meet (Video)           |   |
|  | - Client Portal        |  | - code-server (IDE)            |   |
|  | - API Routes           |  | - Redis (Queue/Cache)          |   |
|  +------------------------+  | - PostgreSQL (n8n DB)          |   |
|            |                 | - Traefik (Reverse Proxy)      |   |
|            |                 +--------------------------------+   |
|            v                              |                       |
|  +------------------------+               v                       |
|  |   SUPABASE (Data)      |  +--------------------------------+   |
|  +------------------------+  |    EXTERNAL SERVICES           |   |
|  | - PostgreSQL + pgvector|  +--------------------------------+   |
|  | - Brain/Memory System  |  | - Twenty CRM (Docker/Cloud)    |   |
|  | - Business Tables      |  | - Invoice Ninja (Docker)       |   |
|  | - Task Queue           |  | - Plane PM (Docker/Cloud)      |   |
|  | - Realtime             |  | - Telnyx (VoIP/SMS)            |   |
|  | - Auth                 |  | - DeepSeek/OpenAI (AI)         |   |
|  +------------------------+  +--------------------------------+   |
|                                                                   |
+------------------------------------------------------------------+
```

---

# TEIL 3: PHASEN-UEBERSICHT

## PHASE 1: INFRASTRUCTURE & FOUNDATION (Woche 1)

**Prioritaet: KRITISCH**

### 1.1 VPS Setup vervollstaendigen

- [ ] SSH auf 72.62.152.47 verbinden
- [ ] Docker Stack deployen (`docker-compose.yml`)
- [ ] SSL-Zertifikate via Traefik/Let's Encrypt
- [ ] Firewall konfigurieren (UFW)
- [ ] Monitoring Setup (Dozzle bereits dabei)

### 1.2 Supabase Schema ausfuehren

- [ ] schema-v2.sql in Supabase SQL Editor ausfuehren
- [ ] Verifizieren: Alle Tabellen erstellt
- [ ] Verifizieren: Alle Functions aktiv
- [ ] Test-Daten einfuegen

### 1.3 DNS & Domains

- [ ] Subdomains erstellen:
  - `app.nexify-automate.com` -> Vercel Dashboard
  - `n8n.nexify-automate.com` -> VPS n8n
  - `meet.nexify-automate.com` -> VPS Jitsi
  - `code.nexify-automate.com` -> VPS code-server
  - `crm.nexify-automate.com` -> Twenty CRM
  - `billing.nexify-automate.com` -> Invoice Ninja
  - `pm.nexify-automate.com` -> Plane

---

## PHASE 2: COMMUNICATION HUB (Woche 1-2)

**Prioritaet: HOCH**

### 2.1 E-Mail System

#### Backend Implementation

```typescript
// src/lib/email/config.ts
export const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: "NeXify AI <info@nexify-automate.com>",
  },
  imap: {
    host: process.env.IMAP_HOST,
    port: 993,
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASS,
  },
};
```

#### Dateien zu erstellen:

- [ ] `src/lib/email/smtp-client.ts` - Nodemailer Setup
- [ ] `src/lib/email/imap-client.ts` - IMAP Receiver
- [ ] `src/lib/email/templates/` - React Email Templates
- [ ] `src/app/api/email/send/route.ts` - Send API
- [ ] `src/app/api/email/inbox/route.ts` - Fetch Inbox
- [ ] `src/components/email/compose-modal.tsx` - UI

#### Dependencies:

```bash
pnpm add nodemailer @types/nodemailer imap @types/imap mailparser @types/mailparser @react-email/components
```

### 2.2 VoIP/Telefonie

#### Telnyx Setup

- [ ] Telnyx Account erstellen
- [ ] DE Telefonnummer kaufen (~1 EUR/Monat)
- [ ] SIP Credentials holen
- [ ] WebRTC Connection ID erstellen

#### Implementation:

- [ ] `src/lib/voip/telnyx-client.ts` - Telnyx SDK
- [ ] `src/lib/voip/sip-client.ts` - SIP.js Browser Client
- [ ] `src/components/voip/dialer.tsx` - Dialer UI
- [ ] `src/components/voip/call-modal.tsx` - Aktiver Call UI
- [ ] `src/app/api/voip/call/route.ts` - Call initiieren
- [ ] `src/app/api/voip/webhook/route.ts` - Call Events

#### Dependencies:

```bash
pnpm add @telnyx/webrtc sip.js
```

### 2.3 Video-Calls (Jitsi)

#### VPS Deployment:

```bash
# Auf VPS ausfuehren
mkdir -p /opt/jitsi && cd /opt/jitsi
wget https://github.com/jitsi/docker-jitsi-meet/archive/refs/heads/stable-9823.zip
unzip stable-9823.zip && cd docker-jitsi-meet-*
cp env.example .env
./gen-passwords.sh
# .env anpassen:
# PUBLIC_URL=https://meet.nexify-automate.com
# ENABLE_LETSENCRYPT=0 (Traefik macht SSL)
docker-compose up -d
```

#### Dashboard Integration:

- [ ] `src/lib/jitsi/config.ts` - Jitsi Config
- [ ] `src/components/video/meeting-room.tsx` - Embedded Meeting
- [ ] `src/components/video/schedule-modal.tsx` - Meeting planen
- [ ] Jitsi Branding (Logo, Farben) konfigurieren

---

## PHASE 3: BUSINESS SUITE INTEGRATION (Woche 2-3)

**Prioritaet: HOCH**

### 3.1 Twenty CRM

#### Deployment Option A (Self-Hosted auf VPS):

```yaml
# In docker-compose.yml hinzufuegen
twenty-server:
  image: twentycrm/twenty:latest
  environment:
    - SERVER_URL=https://crm.nexify-automate.com
    - APP_SECRET=${TWENTY_APP_SECRET}
    - PG_DATABASE_URL=postgres://...
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.twenty.rule=Host(`crm.nexify-automate.com`)"
```

#### Deployment Option B (Cloud):

- Twenty Cloud Account (Free Tier: 3 Users)
- API Key generieren

#### Dashboard Integration:

- [ ] `src/lib/crm/twenty-client.ts` - API Client
- [ ] `src/app/api/crm/[...path]/route.ts` - Proxy Routes
- [ ] `src/app/dashboard/crm/page.tsx` - CRM Overview
- [ ] `src/app/dashboard/crm/contacts/page.tsx` - Kontakte
- [ ] `src/app/dashboard/crm/companies/page.tsx` - Firmen
- [ ] `src/app/dashboard/crm/deals/page.tsx` - Pipeline
- [ ] `src/components/crm/contact-card.tsx` - Kontakt Card
- [ ] `src/components/crm/quick-actions.tsx` - Email/Call Buttons

### 3.2 Invoice Ninja

#### Deployment (Self-Hosted auf VPS):

```yaml
invoiceninja:
  image: invoiceninja/invoiceninja:latest
  environment:
    - APP_URL=https://billing.nexify-automate.com
    - APP_KEY=${INVOICE_NINJA_KEY}
    - DB_HOST=invoiceninja-db
  volumes:
    - ./invoiceninja/public:/var/www/app/public
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.invoiceninja.rule=Host(`billing.nexify-automate.com`)"

invoiceninja-db:
  image: mariadb:10.6
  environment:
    - MYSQL_ROOT_PASSWORD=${IN_MYSQL_ROOT}
    - MYSQL_DATABASE=ninja
    - MYSQL_USER=ninja
    - MYSQL_PASSWORD=${IN_MYSQL_PASS}
  volumes:
    - ./invoiceninja/mysql:/var/lib/mysql
```

#### Dashboard Integration:

- [ ] `src/lib/invoicing/invoice-ninja-client.ts` - API Client
- [ ] `src/app/api/invoicing/[...path]/route.ts` - Proxy
- [ ] `src/app/dashboard/invoicing/page.tsx` - Overview
- [ ] `src/app/dashboard/invoicing/create/page.tsx` - Neue Rechnung
- [ ] `src/components/invoicing/invoice-preview.tsx` - Preview
- [ ] `src/components/invoicing/payment-status.tsx` - Status Badge

### 3.3 Plane (Project Management)

#### Deployment (Self-Hosted auf VPS):

```bash
mkdir -p /opt/plane && cd /opt/plane
curl -fsSL https://prime.plane.so/install/ | sh -
# Konfigurieren fuer https://pm.nexify-automate.com
```

#### Dashboard Integration:

- [ ] `src/lib/pm/plane-client.ts` - API Client
- [ ] `src/app/api/pm/[...path]/route.ts` - Proxy
- [ ] `src/app/dashboard/projects/page.tsx` - Projekte
- [ ] `src/app/dashboard/projects/[id]/page.tsx` - Projekt Detail
- [ ] `src/components/pm/kanban-board.tsx` - Kanban View
- [ ] `src/components/pm/task-card.tsx` - Task Card
- [ ] `src/components/pm/cycle-progress.tsx` - Sprint Progress

---

## PHASE 4: AI AGENTS & AUTOMATION (Woche 3-4)

**Prioritaet: HOCH**

### 4.1 Task Queue Worker

#### Supabase Realtime Listener:

```typescript
// src/lib/queue/worker.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, key);

// Listen for new tasks
supabase
  .channel("task_queue")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "task_queue",
    },
    (payload) => {
      processTask(payload.new);
    },
  )
  .subscribe();
```

#### n8n Workflow Integration:

- [ ] Webhook Trigger fuer neue Tasks
- [ ] Agent-spezifische Sub-Workflows
- [ ] Result Callback an Dashboard

### 4.2 AI Agents Implementation

#### Code Agent:

- [ ] `src/lib/agents/code-agent.ts`
- Capabilities: Code Review, Bug Fix, Feature Implementation
- Tools: GitHub MCP, File Operations, Terminal

#### Content Agent:

- [ ] `src/lib/agents/content-agent.ts`
- Capabilities: Blog Posts, Social Media, Newsletter
- Tools: Web Search, Template Engine

#### Design Agent:

- [ ] `src/lib/agents/design-agent.ts`
- Capabilities: UI Components, Graphics, Logos
- Tools: Hugging Face Image Gen, Penpot API

#### SEO Agent:

- [ ] `src/lib/agents/seo-agent.ts`
- Capabilities: Keyword Research, Meta Tags, Content Analysis
- Tools: Web Search, Analytics API

#### Legal Agent:

- [ ] `src/lib/agents/legal-agent.ts`
- Capabilities: AGB, Datenschutz, Impressum, Vertraege
- Tools: Template Engine, German Law RAG

#### Support Agent:

- [ ] `src/lib/agents/support-agent.ts`
- Capabilities: FAQ, Troubleshooting, Ticket Creation
- Tools: Knowledge Base RAG, CRM Integration

### 4.3 n8n Workflows

#### Zu erstellende Workflows:

- [ ] `new-lead-notification` - Email bei neuem CRM Lead
- [ ] `invoice-reminder` - Zahlungserinnerung
- [ ] `project-status-update` - Woechentlicher Report
- [ ] `ai-task-processor` - Agent Task Dispatcher
- [ ] `backup-workflow` - Taegliches Backup
- [ ] `health-check` - System Monitoring

---

## PHASE 5: CLIENT PORTAL & MARKETING (Woche 4-5)

**Prioritaet: MITTEL**

### 5.1 Marketing Pages

#### Seiten zu erstellen:

- [ ] `/` - Landing Page (Hero, Features, Pricing, CTA)
- [ ] `/services` - AI Services Uebersicht
- [ ] `/services/[slug]` - Einzelne Service Pages
- [ ] `/pricing` - Preistabelle
- [ ] `/about` - Ueber uns
- [ ] `/contact` - Kontaktformular
- [ ] `/blog` - Blog (optional)
- [ ] `/legal/impressum` - Impressum
- [ ] `/legal/datenschutz` - Datenschutz
- [ ] `/legal/agb` - AGB

### 5.2 Client Portal

#### Features:

- [ ] Client Login (Supabase Auth)
- [ ] Projekt-Uebersicht
- [ ] Rechnungen einsehen/bezahlen
- [ ] Dokumente herunterladen
- [ ] Support-Tickets erstellen
- [ ] Meeting buchen (Calendly/Cal.com Integration)

#### Seiten:

- [ ] `/portal` - Dashboard
- [ ] `/portal/projects` - Meine Projekte
- [ ] `/portal/invoices` - Rechnungen
- [ ] `/portal/documents` - Dokumente
- [ ] `/portal/support` - Support

### 5.3 CI/Branding Assets

#### Zu erstellen:

- [ ] Logo SVG (Primary + White + Icon)
- [ ] Favicon (16x16, 32x32, apple-touch-icon)
- [ ] OG Image Template (1200x630)
- [ ] Email Header/Footer
- [ ] PDF Header/Footer (Rechnungen)
- [ ] Jitsi Watermark
- [ ] Social Media Templates

---

## PHASE 6: TESTING, CI/CD & GO-LIVE (Woche 5-6)

**Prioritaet: HOCH**

### 6.1 Testing

#### Unit Tests:

- [ ] API Routes testen
- [ ] Utility Functions testen
- [ ] Component Tests

#### Integration Tests:

- [ ] CRM API Integration
- [ ] Invoicing API Integration
- [ ] Email Versand
- [ ] VoIP Connection

#### E2E Tests:

- [ ] User Flows (Playwright)
- [ ] Critical Paths

### 6.2 CI/CD Pipeline

#### GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build

  deploy-vercel:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-vps:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: 72.62.152.47
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/nexify
            docker-compose pull
            docker-compose up -d
```

### 6.3 Go-Live Checklist

#### Pre-Launch:

- [ ] Alle Tests bestanden
- [ ] SSL Zertifikate aktiv
- [ ] Backups konfiguriert
- [ ] Monitoring aktiv
- [ ] Error Tracking (Sentry) Setup
- [ ] Analytics Setup
- [ ] SEO Meta Tags
- [ ] robots.txt / sitemap.xml
- [ ] Performance Check (Lighthouse > 90)

#### Launch:

- [ ] DNS umstellen
- [ ] Vercel Production Deploy
- [ ] VPS Services starten
- [ ] Smoke Tests durchfuehren
- [ ] Monitoring pruefen

#### Post-Launch:

- [ ] User Feedback sammeln
- [ ] Bug Fixes priorisieren
- [ ] Performance optimieren
- [ ] Documentation aktualisieren

---

# TEIL 4: DATEIEN-STRUKTUR (Ziel)

```
apps/dashboard-new/
├── src/
│   ├── app/
│   │   ├── (marketing)/           # Public Pages
│   │   │   ├── page.tsx           # Landing
│   │   │   ├── services/
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── legal/
│   │   ├── (portal)/              # Client Portal
│   │   │   ├── portal/
│   │   │   └── layout.tsx
│   │   ├── dashboard/             # Admin Dashboard
│   │   │   ├── page.tsx           # Overview
│   │   │   ├── chat/              # AI Chat
│   │   │   ├── brain/             # Knowledge Base
│   │   │   ├── crm/               # CRM (Twenty)
│   │   │   ├── invoicing/         # Invoicing
│   │   │   ├── projects/          # PM (Plane)
│   │   │   ├── email/             # Email Client
│   │   │   ├── calendar/          # Calendar
│   │   │   ├── agents/            # AI Agents
│   │   │   ├── analytics/         # Analytics
│   │   │   └── settings/          # Settings
│   │   └── api/
│   │       ├── chat/
│   │       ├── email/
│   │       ├── voip/
│   │       ├── crm/
│   │       ├── invoicing/
│   │       ├── pm/
│   │       ├── agents/
│   │       └── webhooks/
│   ├── components/
│   │   ├── ui/                    # shadcn + Premium
│   │   ├── email/
│   │   ├── voip/
│   │   ├── video/
│   │   ├── crm/
│   │   ├── invoicing/
│   │   ├── pm/
│   │   └── agents/
│   ├── lib/
│   │   ├── brain/                 # Existing
│   │   ├── mcp/                   # Existing
│   │   ├── email/                 # NEW
│   │   ├── voip/                  # NEW
│   │   ├── jitsi/                 # NEW
│   │   ├── crm/                   # NEW
│   │   ├── invoicing/             # NEW
│   │   ├── pm/                    # NEW
│   │   ├── agents/                # NEW
│   │   ├── queue/                 # NEW
│   │   └── utils/
│   ├── emails/                    # React Email Templates
│   └── styles/
├── supabase/
│   └── schema-v2.sql
└── package.json

infrastructure/
├── vps/
│   ├── docker-compose.yml         # Erweitert
│   ├── .env.example
│   ├── setup.sh
│   ├── jitsi/                     # Jitsi Config
│   ├── twenty/                    # Twenty Config
│   ├── invoiceninja/              # Invoice Ninja Config
│   └── plane/                     # Plane Config
└── n8n/
    └── workflows/                 # Exportierte Workflows
```

---

# TEIL 5: AUTONOME TASK-LISTE

## SOFORT (Phase 1)

1. VPS Docker Stack deployen
2. Supabase Schema ausfuehren
3. DNS Subdomains erstellen
4. Jitsi Meet deployen und branden

## DIESE WOCHE (Phase 2)

5. Email System implementieren (SMTP + IMAP)
6. Email Compose Modal erstellen
7. Telnyx Account + Nummer
8. VoIP Integration (SIP.js)

## NAECHSTE WOCHE (Phase 3)

9. Twenty CRM deployen
10. CRM Dashboard Pages
11. Invoice Ninja deployen
12. Invoicing Dashboard Pages
13. Plane deployen
14. PM Dashboard Pages

## WOCHE 3-4 (Phase 4)

15. Task Queue Worker
16. n8n Workflows erstellen
17. Code Agent fertigstellen
18. Content Agent implementieren
19. Weitere Agents

## WOCHE 4-5 (Phase 5)

20. Marketing Landing Page
21. Service Pages
22. Client Portal
23. Branding Assets

## WOCHE 5-6 (Phase 6)

24. Tests schreiben
25. CI/CD Pipeline
26. Go-Live

---

# TEIL 6: ENVIRONMENT VARIABLES

```env
# === CORE ===
NEXT_PUBLIC_APP_URL=https://app.nexify-automate.com
NEXTAUTH_SECRET=your-secret

# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://cwebcfgdraghzeqgfsty.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# === AI ===
DEEPSEEK_API_KEY=xxx
OPENAI_API_KEY=xxx

# === QDRANT ===
QDRANT_URL=xxx
QDRANT_API_KEY=xxx

# === EMAIL ===
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
IMAP_HOST=imap.example.com
IMAP_PORT=993
IMAP_USER=xxx
IMAP_PASS=xxx

# === VOIP (Telnyx) ===
TELNYX_API_KEY=xxx
TELNYX_SIP_USER=xxx
TELNYX_SIP_PASS=xxx
TELNYX_PHONE_NUMBER=+49xxx

# === VIDEO (Jitsi) ===
NEXT_PUBLIC_JITSI_DOMAIN=meet.nexify-automate.com

# === CRM (Twenty) ===
TWENTY_API_URL=https://crm.nexify-automate.com
TWENTY_API_KEY=xxx

# === INVOICING (Invoice Ninja) ===
INVOICE_NINJA_URL=https://billing.nexify-automate.com
INVOICE_NINJA_TOKEN=xxx

# === PM (Plane) ===
PLANE_API_URL=https://pm.nexify-automate.com
PLANE_API_KEY=xxx

# === N8N ===
N8N_WEBHOOK_URL=https://n8n.nexify-automate.com/webhook
```

---

# TEIL 7: COMMANDS QUICK REFERENCE

```bash
# === LOCAL DEV ===
cd apps/dashboard-new
pnpm dev

# === DEPLOY VERCEL ===
pnpm dlx vercel --prod

# === VPS SSH ===
ssh root@72.62.152.47

# === VPS DOCKER ===
cd /opt/nexify
docker-compose up -d
docker-compose logs -f
docker-compose ps

# === SUPABASE ===
# Schema ausfuehren: https://supabase.com/dashboard/project/cwebcfgdraghzeqgfsty/sql/new

# === N8N ===
# Dashboard: https://n8n.srv1243952.hstgr.cloud/

# === GIT ===
git add . && git commit -m "message" && git push
```

---

# ENDE DES MASTERPLANS

**Erstellt:** 11. Januar 2026
**Autor:** NeXify AI Agent
**Version:** 1.0

> Dieser Plan ist verbindlich und wird sequentiell abgearbeitet.
> Jede abgeschlossene Aufgabe wird in Supabase task_queue als 'completed' markiert.
