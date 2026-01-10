# NeXify AI - Brain Knowledge Base

**Zuletzt aktualisiert:** 2026-01-10 16:00 UTC

---

## 🧠 AKTIVER KONTEXT

### Aktueller Status

- **Deployment:** Vercel Monorepo Config gefixt, wartet auf Build
- **URL:** https://nexifyai-pascals-asistent.vercel.app
- **Letzter Commit:** `3bb8c54` - rootDirectory für Monorepo

### Offene Tasks

1. Vercel Deploy verifizieren
2. Chat UI testen
3. RAG System implementieren

---

## 📚 GELERNTE FAKTEN

### Projekt

- **Name:** NeXify AI / Pascals Assistent
- **Typ:** Monorepo mit Turbo
- **Haupt-App:** `apps/dashboard` (Next.js 16)
- **Owner:** Pascal

### Technische Entscheidungen

| Datum      | Entscheidung                     | Grund                             |
| ---------- | -------------------------------- | --------------------------------- |
| 2026-01-10 | AI SDK entfernt                  | Zod 3.25 Inkompatibilität         |
| 2026-01-10 | OpenAI SDK direkt                | Stabil, keine Middleware          |
| 2026-01-10 | rootDirectory statt buildCommand | Vercel Best Practice für Monorepo |

### Credentials (Referenz, nicht Werte)

- OpenAI API Key: In Vercel gesetzt
- Qdrant: URL + API Key in Vercel
- Webhook Secret: `WahphdJNfwuUYaqGG3DwMVQd`
- Legacy Assistant ID: `asst_NZtoNWLUW58mWYXLXxV6xeR5`

---

## 🔄 SESSION HISTORY

### Session 2026-01-10

**Themen:**

1. Zod/AI SDK Konflikt diagnostiziert und gelöst
2. Legacy Code Cleanup (hooks, lib/ai, lib/editor)
3. Vercel Webhook mit Signature Verification
4. Monorepo Deployment Konfiguration

**Commits:**

- `09465e6` - AI SDK entfernt, Cleanup
- `929c05e` - vercel.json functions path
- `b6b0102` - tailwind config formatting
- `d1dd6b2` - buildCommand/outputDirectory
- `3bb8c54` - rootDirectory für Monorepo

**Gelöste Probleme:**

- Build Fehler durch fehlende AI SDK Types
- Vercel functions pattern mismatch
- Leere Seite (falscher .next Ordner)

---

## 📋 REGELN & PRÄFERENZEN

→ Siehe `PROJEKT_REGELN.md` für vollständige Liste

**Kurzfassung:**

1. IST-Analyse IMMER ZUERST
2. Templates/Blueprints nutzen (Open-Source)
3. Deutsch mit Pascal
4. Keine unnötigen Erklärungen
5. Schnelle, funktionierende Lösungen

---

## 🗄️ MEMORY SYSTEMS

### Lokal (Dateien)

- `PROJEKT_REGELN.md` - Feste Regeln
- `BRAIN_KNOWLEDGE.md` - Diese Datei
- `knowledge/` - Zusätzliches Wissen

### Online (APIs)

- **Qdrant:** Vector DB für Embeddings
  - Collection: `brain_memory`
  - Types: fact, code, preference, conversation
- **Supermemory/Postgres:** Fallback Memory Provider
  - Tabelle: `knowledge`
  - Felder: content, category, tags, metadata, isActive

---

## 🎯 ZIELE

### Kurzfristig

- [ ] Funktionierendes Chat UI online
- [ ] Basis RAG mit Qdrant

### Mittelfristig

- [ ] MCP Server Repository
- [ ] Erweiterte Tools (Web Search, Code Execution)
- [ ] Besseres UI (shadcn Template)

### Langfristig

- [ ] Vollständig autonomer Assistent
- [ ] Selbstlernend durch Interaktionen
- [ ] Multi-Modal (Text, Bild, Code)

---

## 🏗️ PROJEKTSTRUKTUR (AKTUELL)

```
nexify-ai-os/                    # Monorepo Root
├── apps/
│   └── dashboard/               # ⭐ HAUPT-APP (Next.js 16)
│       ├── app/                 # App Router
│       │   ├── page.tsx         # Chat UI (Custom useChat Hook)
│       │   └── api/             # API Routes
│       │       ├── chat/route.ts        # OpenAI Streaming
│       │       ├── mcp/                 # MCP Tools
│       │       └── webhooks/vercel/     # Vercel Events
│       ├── lib/
│       │   ├── qdrant.ts        # Vector DB Client
│       │   ├── supermemory.ts   # Memory Provider Abstraction
│       │   ├── db/              # Drizzle ORM
│       │   └── utils.ts
│       ├── components/          # UI Components
│       └── vercel.json          # Functions Config
├── packages/                    # Shared Packages (tools)
├── knowledge/                   # Wissensdateien
├── PROJEKT_REGELN.md           # Feste Regeln
├── BRAIN_KNOWLEDGE.md          # Diese Datei
└── vercel.json                  # rootDirectory: apps/dashboard
```

---

## 🔧 TECH STACK

| Komponente | Technologie      | Version  | Status           |
| ---------- | ---------------- | -------- | ---------------- |
| Framework  | Next.js          | 16.1.1   | ✅               |
| Runtime    | React            | 19.x     | ✅               |
| Styling    | Tailwind CSS     | 4.x      | ✅               |
| AI         | OpenAI SDK       | 6.x      | ✅               |
| Database   | Postgres/Drizzle | -        | ✅               |
| Vector DB  | Qdrant           | -        | ⚠️ Config prüfen |
| Auth       | NextAuth         | 5.x beta | ⚠️ Nicht aktiv   |

### NICHT VERWENDEN:

- ❌ `ai` (Vercel AI SDK)
- ❌ `@ai-sdk/*`
- ❌ `zod-to-json-schema`
