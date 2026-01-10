# NeXify AI - Brain Knowledge Base

**Zuletzt aktualisiert:** 2026-01-10 16:30 UTC

---

## 🧠 AKTIVER KONTEXT

### Aktueller Status

- **Deployment:** ✅ LIVE auf Vercel
- **Landing Page:** https://dashboard-six-tawny-72.vercel.app/
- **Chat App:** https://dashboard-six-tawny-72.vercel.app/chat
- **Projekt:** `pascals-projects-2864de33/dashboard`

### Offene Tasks

→ Siehe `SPÄTER_TODO.md` für aufgeschobene Aufgaben

---

## 📚 GELERNTE FAKTEN

### Projekt

- **Name:** NeXify AI / Pascals Assistent
- **Typ:** Monorepo (ursprünglich), jetzt Standalone Dashboard
- **Haupt-App:** `apps/dashboard` (Next.js 16)
- **Owner:** Pascal Courbois (NeXifyAI)

### Technische Entscheidungen

| Datum      | Entscheidung                    | Grund                     |
| ---------- | ------------------------------- | ------------------------- |
| 2026-01-10 | AI SDK entfernt                 | Zod 3.25 Inkompatibilität |
| 2026-01-10 | OpenAI SDK direkt               | Stabil, keine Middleware  |
| 2026-01-10 | npm statt pnpm für Vercel       | pnpm ERR_INVALID_THIS Bug |
| 2026-01-10 | Einfachster Weg zuerst          | User-Regel                |
| 2026-01-10 | Danach auf Soll-Zustand bringen | User-Regel                |

### Credentials (Referenz)

Vollständige Liste in `nexify-ai-assietenten-api-keys.txt`

**Wichtigste:**

- Vercel Token: `Fe9LZrJxjj0819FQCqFZfrdq`
- OpenAI API Key: In Vercel gesetzt
- Qdrant: URL + API Key in Vercel
- Webhook Secret: `WahphdJNfwuUYaqGG3DwMVQd`
- GitHub Token: (siehe nexify-ai-assietenten-api-keys.txt)

---

## 🔄 SESSION HISTORY

### Session 2026-01-10 (Aktuell)

**Erreicht:**

1. ✅ Zod/AI SDK Konflikt gelöst
2. ✅ Legacy Code Cleanup
3. ✅ Vercel Deployment funktioniert
4. ✅ Landing Page erstellt
5. ✅ Chat unter /chat verfügbar
6. ✅ Templates geklont (landing-page, backend-elemente)

**Gelernte Regeln:**

- **EINFACHSTER WEG ZUERST** - Schnell zum Laufen bringen
- **DANACH SOLL-ZUSTAND** - Immer, ohne Ausnahme

---

## 📋 REGELN & PRÄFERENZEN

→ Siehe `PROJEKT_REGELN.md` für vollständige Liste

**Kurzfassung:**

1. IST-Analyse IMMER ZUERST
2. Einfachster Weg zuerst, dann Soll-Zustand
3. Templates/Blueprints nutzen (Open-Source)
4. Deutsch mit Pascal
5. Keine unnötigen Erklärungen
6. Schnelle, funktionierende Lösungen

---

## 🗄️ MEMORY SYSTEMS

### Lokal (Dateien)

- `PROJEKT_REGELN.md` - Feste Regeln
- `BRAIN_KNOWLEDGE.md` - Diese Datei
- `SPÄTER_TODO.md` - Aufgeschobene Aufgaben
- `nexify-ai-assietenten-api-keys.txt` - Alle Credentials
- `templates/` - Geklonte Design-Templates

### Online (APIs)

- **Qdrant:** Vector DB für Embeddings
  - Cluster: `f256664d-f56d-42e5-8fbd-e724b5f832bf`
  - Endpoint: `europe-west3-0.gcp.cloud.qdrant.io`

---

## 🎯 ZIELE

### ✅ Erreicht

- [x] Funktionierendes Chat UI online
- [x] Landing Page live
- [x] Vercel Deployment stabil

### Nächste Schritte

- [ ] Aus Vercel-Umgebung weiterarbeiten
- [ ] Design-Templates einarbeiten (später)
- [ ] Remote-Zugriff auf PC (später)

---

## 🏗️ PROJEKTSTRUKTUR (AKTUELL)

```
nexify-ai-os/
├── apps/
│   └── dashboard/               # ⭐ HAUPT-APP (Next.js 16)
│       ├── app/
│       │   ├── page.tsx         # Landing Page
│       │   ├── chat/page.tsx    # Chat UI
│       │   └── api/
│       │       ├── chat/route.ts
│       │       ├── mcp/
│       │       └── webhooks/vercel/
│       ├── lib/
│       ├── .vercel/             # Vercel CLI Config
│       ├── vercel.json
│       └── package.json
├── templates/                   # Design Templates (geklont)
│   ├── landing-page/
│   └── backend-elemente/
├── PROJEKT_REGELN.md
├── BRAIN_KNOWLEDGE.md
├── SPÄTER_TODO.md              # NEU
└── nexify-ai-assietenten-api-keys.txt
```

---

## 🔧 TECH STACK

| Komponente | Technologie  | Version | Status |
| ---------- | ------------ | ------- | ------ |
| Framework  | Next.js      | 16.1.1  | ✅     |
| Runtime    | React        | 19.x    | ✅     |
| Styling    | Tailwind CSS | 4.x     | ✅     |
| AI         | OpenAI SDK   | 6.x     | ✅     |
| Deploy     | Vercel       | -       | ✅     |
| Package    | npm          | -       | ✅     |

### NICHT VERWENDEN:

- ❌ `ai` (Vercel AI SDK) - Zod Konflikt
- ❌ `@ai-sdk/*`
- ❌ pnpm auf Vercel - ERR_INVALID_THIS Bug
