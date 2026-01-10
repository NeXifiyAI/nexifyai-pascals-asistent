# NeXify AI - Brain Knowledge Base

**Zuletzt aktualisiert:** 2026-01-10 17:25 UTC

---

## AKTIVE ARBEIT - VERCEL AI SDK MIGRATION

### Entscheidung (2026-01-10)

**Vercel AI Chatbot** als Basis - sauber, offiziell, erweiterbar

### PROBLEM ENTDECKT (2026-01-10 17:30)

**Zod 3.25.76 ist INKOMPATIBEL mit AI SDK!**

Fehler:

- `zod-to-json-schema` kann `ZodFirstPartyTypeKind` nicht aus `zod/v3` importieren
- Das ist ein bekanntes Problem mit Zod 3.25+
- AI SDK bringt Zod 3.25.76 als Abhangigkeit mit

**LOSUNG:** Zod auf 3.24.x pinnen (kompatible Version)

### Zweites Problem

**`tw-animate-css`** nicht installiert im Dashboard (fehlt in node_modules)

### Aktueller Schritt

1. [DONE] Vercel AI SDK installiert (ai, @ai-sdk/react, @ai-sdk/openai)
2. [DONE] Chat-Route migriert zu `streamText()`
3. [DONE] Frontend migriert zu `useChat`
4. [BLOCKED] Build failed - Zod Konflikt + tw-animate-css fehlt
5. [NEXT] Zod fixen + tw-animate-css installieren

### Wichtige Dateien die geandert werden

| Datei                                  | IST                                | SOLL                                      |
| -------------------------------------- | ---------------------------------- | ----------------------------------------- |
| `apps/dashboard/package.json`          | Nur `openai` SDK                   | + `ai`, `@ai-sdk/react`, `@ai-sdk/openai` |
| `apps/dashboard/app/api/chat/route.ts` | Custom Stream mit `openai`         | `streamText()` von `ai`                   |
| `apps/dashboard/app/chat/page.tsx`     | Custom `useChat` Hook (150 Zeilen) | `useChat` von `@ai-sdk/react` (10 Zeilen) |

### Backup der alten Dateien

Falls Rollback notig:

- `/api/chat/route.ts` - Custom OpenAI Streaming
- `/chat/page.tsx` - Custom useChat Hook

---

## AKTUELLER KONTEXT

### Aktueller Status

- **Deployment:** LIVE auf Vercel
- **Landing Page:** https://dashboard-six-tawny-72.vercel.app/
- **Chat App:** https://dashboard-six-tawny-72.vercel.app/chat
- **Projekt:** `pascals-projects-2864de33/dashboard`

### Technische Fakten (AKTUELL)

| Komponente | Version           | Status         |
| ---------- | ----------------- | -------------- |
| Next.js    | 16.1.1            | OK             |
| React      | 19.x              | OK             |
| OpenAI SDK | 6.16.0            | OK             |
| Zod        | NICHT installiert | Gut fur AI SDK |
| pnpm       | 9.12.3            | Lokal OK       |
| Node       | 20.x              | Vercel OK      |

### Fruhere Zod-Probleme (GELOST?)

- 2026-01-10: AI SDK hatte Zod 3.25 Konflikt
- JETZT: Kein Zod installiert = sollte sauber funktionieren
- PLAN: AI SDK neu installieren und testen

---

## CREDENTIALS (Referenz)

Vollstandige Liste in `nexify-ai-assietenten-api-keys.txt`

**Wichtigste:**

- Vercel Token: `Fe9LZrJxjj0819FQCqFZfrdq`
- OpenAI API Key: In Vercel ENV gesetzt
- Qdrant: URL + API Key in Vercel ENV
- Webhook Secret: `WahphdJNfwuUYaqGG3DwMVQd`

---

## BRAIN SYSTEMS (Geplant)

### Phase 1: Vercel AI SDK (JETZT)

- `ai` - Core SDK
- `@ai-sdk/react` - React Hooks (useChat, useCompletion)
- `@ai-sdk/openai` - OpenAI Provider

### Phase 2: Memory/Brain

- `@mem0/vercel-ai-provider` - Memory Layer
- `@qdrant/js-client-rest` - Vector DB (bereits installiert!)

### Phase 3: Tools

- Tool Calling via AI SDK
- MCP Integration (Streamable HTTP)

---

## PROJEKTSTRUKTUR

```
pascals-aktiver-assistent-nichts-loeschen/
├── apps/
│   └── dashboard/               # HAUPT-APP (Next.js 16)
│       ├── app/
│       │   ├── page.tsx         # Landing Page
│       │   ├── chat/page.tsx    # Chat UI [WIRD MIGRIERT]
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   └── api/
│       │       ├── chat/route.ts  # [WIRD MIGRIERT]
│       │       ├── mcp/
│       │       │   ├── route.ts
│       │       │   ├── call/route.ts
│       │       │   ├── tools/route.ts
│       │       │   └── status/route.ts
│       │       └── webhooks/vercel/route.ts
│       ├── components/
│       ├── public/images/
│       ├── .vercel/
│       ├── vercel.json
│       ├── package.json
│       ├── tsconfig.json
│       └── tailwind.config.ts
├── packages/                    # Leer/Skelett
├── services/                    # MCP Services
├── templates/                   # Design Templates
├── knowledge/
├── PROJEKT_REGELN.md
├── BRAIN_KNOWLEDGE.md          # DIESE DATEI
├── SPATER_TODO.md
├── MISSION.md
├── ARCHITECTURE.md
└── nexify-ai-assietenten-api-keys.txt
```

---

## REGELN (Pascal's Praferenzen)

1. **IST-Analyse IMMER ZUERST** - Vor jeder Anderung prufen
2. **EINFACHSTER WEG ZUERST** - Schnell zum Laufen bringen
3. **DANACH SOLL-ZUSTAND** - Immer, ohne Ausnahme!
4. **Dokumentieren** - Wissen nicht verlieren (kein Brain noch!)
5. **Deutsch** mit Pascal
6. **German Engineering Standards:** 99.99% uptime, <100ms, zero errors

---

## SESSION HISTORY

### Session 2026-01-10 (Aktuell)

**Erreicht:**

1. Zod/AI SDK Konflikt analysiert
2. Legacy Code Cleanup
3. Vercel Deployment funktioniert
4. Landing Page + Chat live
5. Templates geklont
6. Entscheidung: Vercel AI Chatbot als Basis
7. [IN PROGRESS] AI SDK Migration gestartet

**Nachste Schritte nach Migration:**

- Chat Persistenz (PostgreSQL)
- Brain System (mem0 + Qdrant)
- MCP Tool Integration
- AI-Team Orchestration
