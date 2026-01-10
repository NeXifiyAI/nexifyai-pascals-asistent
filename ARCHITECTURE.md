# NeXifyAI – Master-Bauplan (Canvas)

## Zweck & Vision

NeXifyAI ist ein **persönlicher, agentischer AI‑Assistent**, der nicht als Chatbot, sondern als **operatives AI‑Betriebssystem** konzipiert ist. Er arbeitet **CLI‑first**, ist über ein **edles Dashboard steuerbar**, integriert **Code, GitHub, Browser, Tools und Gedächtnis** und arbeitet **kooperativ mit dem Menschen (Human‑in‑the‑Loop)**.

Ziel ist kein Experiment, sondern ein **langfristig wartbares, erweiterbares und kundenfähig demonstrierbares System**.

---

## Leitprinzipien (verbindlich)

1. **Separation of Concerns**
   UI, Agenten, Tools, Gedächtnis und Infrastruktur sind strikt getrennt.

2. **CLI‑First, UI‑Supported**
   Die CLI ist das primäre Arbeitsinstrument, das Dashboard ist Steuer‑ und Kontrollzentrum.

3. **Human‑in‑the‑Loop by Design**
   Kritische Aktionen benötigen explizite Freigabe.

4. **Standards statt Eigenbau**
   MCP, Supabase, Playwright, Biome, GitHub API, opencode.

5. **Kundenfähig ab Tag 1**
   Transparenz, Auditierbarkeit, Read‑Only‑Modus.

---

## Gesamtarchitektur

Die Architektur trennt **Denken**, **Handeln**, **Wissen** und **Darstellung** sauber:

* **Dashboard**: Visualisierung & Steuerung
* **Supabase**: Wahrheit, State, Events
* **Agenten**: Planung & Ausführung
* **MCP**: Standardisierte Tool‑Anbindung
* **Memory**: Langzeitwissen

```
Dashboard (Vercel)
   ↓ Realtime
Supabase (State, Events, Vault)
   ↓
Agentic Control Layer
   ↓
opencode (Reasoning)
   ↓ MCP
MCP Connection Server
   ↓
MCP Tool Server
   ↓
Supermemory / Vector DB
```

---

## Repository‑Struktur (Vorgabe)

```text
nexifyai-pascals-asistent/
├─ apps/
│  └─ dashboard/        → einziges Vercel‑Deploy
├─ services/
│  ├─ mcp-tool-server/  → Tools (GitHub, Browser, Biome)
│  ├─ mcp-connection/   → Routing & Discovery
│  └─ cli/              → lokaler Assistent
├─ packages/
│  ├─ core/
│  ├─ agentic/
│  └─ opencode-wrapper/
├─ infra/
│  └─ supabase/
├─ package.json
├─ vercel.json
└─ README.md
```

---

## Hosting‑Strategie (verbindlich)

### Vercel
* Hostet ausschließlich `apps/dashboard`
* Autodeploy via GitHub
* Kein MCP, kein Browser, keine CLI

### Lokal / VPS / Fly.io
* MCP Tool Server
* MCP Connection Server
* CLI
* Playwright Browser

---

## Dashboard (NeXifyAI OS)

### Tech‑Stack
* Next.js 14 (App Router)
* Tailwind CSS
* Radix UI
* Framer Motion
* Supabase Realtime

### Navigation
```
Overview
Agents
Tasks
Reviews
Memory
Browser
API Keys
System
```

---

## Supabase – System of Record

### Kern‑Tabellen
* `agents`, `tasks`, `agent_runs`, `tool_calls`, `events`, `approvals`, `api_keys`, `costs`

---

## API‑Key‑Vault (Pflichtmodul)
* Verschlüsselt, nie im Klartext.
* UI für Add / Rotate / Disable.

---

## MCP – Tool‑Standard
* **MCP Connection Server**: Client Registry, Routing.
* **MCP Tool Server**: GitHub, Biome, Filesystem, Browser (Playwright), Memory Bridge.

---

## Human‑in‑the‑Loop (verbindlich)
* **Approval nötig für**: Code schreiben, PR erstellen, Browser‑Interaktionen.
* **Dashboard zeigt**: Diff, Aktion, Begründung.

---

## Gedächtnis‑Strategie
* **Kurzfristig**: Session Memory
* **Langfristig**: Supermemory / Vector DB (Qdrant), Reviews, Commits.

---

## Fazit
NeXifyAI ist kein Chatbot, sondern ein **persönliches AI‑Betriebssystem**.
