# NeXify AI - Projekt Regeln & Gelerntes Wissen

**Zuletzt aktualisiert:** 2026-01-10

---

## 🎯 FESTE REGELN (IMMER BEFOLGEN)

### 1. IST-Analyse ZUERST

**BEVOR** du irgendetwas änderst oder implementierst:

1. Prüfe die aktuelle Projektstruktur
2. Prüfe alle relevanten Konfigurationsdateien
3. Prüfe ob Dependencies vorhanden und korrekt sind
4. Prüfe ob Build/Deploy funktioniert
5. Identifiziere was FEHLT vs. was FALSCH KONFIGURIERT ist

### 2. Templates & Blueprints nutzen

- **NIEMALS** alles selbst neu entwickeln
- **IMMER** zuerst nach Open-Source Templates suchen
- Nur kostenfreie/Open-Source Lösungen
- Bevorzugte Quellen:
  - GitHub Trending/Explore
  - Vercel Templates
  - shadcn/ui Components
  - T3 Stack / Create-Next-App

### 3. Sprache

- Mit Pascal: **DEUTSCH**
- Code/Kommentare: Englisch

---

## 📁 PROJEKT-STRUKTUR

```
nexify-ai-os/                    # Monorepo Root
├── apps/
│   └── dashboard/               # ⭐ HAUPT-APP (Next.js 16)
│       ├── app/                 # App Router
│       │   ├── page.tsx         # Chat UI
│       │   └── api/             # API Routes
│       │       ├── chat/        # OpenAI Chat Streaming
│       │       ├── mcp/         # MCP Tools
│       │       └── webhooks/    # Vercel Webhooks
│       ├── lib/                 # Utilities
│       │   ├── qdrant.ts        # Vector DB Client
│       │   └── supermemory.ts   # Memory Provider
│       ├── components/          # UI Components
│       ├── vercel.json          # Vercel Config (functions)
│       └── package.json
├── packages/                    # Shared Packages
├── knowledge/                   # Wissensdateien
├── vercel.json                  # Root: nur rootDirectory
└── PROJEKT_REGELN.md           # ⭐ DIESE DATEI
```

---

## ⚙️ VERCEL DEPLOYMENT (MONOREPO)

### Korrekte Konfiguration:

**Root `vercel.json`:**

```json
{
  "rootDirectory": "apps/dashboard"
}
```

**`apps/dashboard/vercel.json`:**

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Häufige Fehler:

- ❌ `functions` Pfad mit `apps/dashboard/...` im Root
- ❌ `outputDirectory` manuell setzen bei Next.js
- ❌ `.next` Ordner im Root (verwirrt Vercel)
- ✅ `rootDirectory` im Root setzen
- ✅ Relative Pfade in Dashboard `vercel.json`

---

## 🔧 TECH STACK

| Komponente      | Technologie         | Version  |
| --------------- | ------------------- | -------- |
| Framework       | Next.js             | 16.1.1   |
| Runtime         | React               | 19.x     |
| Styling         | Tailwind CSS        | 4.x      |
| AI              | OpenAI SDK (direkt) | 6.x      |
| Database        | Postgres (Drizzle)  | -        |
| Vector DB       | Qdrant              | -        |
| Auth            | NextAuth            | 5.x beta |
| Package Manager | pnpm                | 9.x      |

### NICHT VERWENDEN:

- ❌ Vercel AI SDK (`ai`, `@ai-sdk/*`) - Zod Konflikt!
- ❌ `zod-to-json-schema` - Inkompatibel mit zod 3.25+

---

## 🔑 ENVIRONMENT VARIABLES

### Vercel (Produktiv):

```
OPENAI_API_KEY=sk-...
POSTGRES_URL=postgres://...
QDRANT_URL=https://...
QDRANT_API_KEY=...
VERCEL_WEBHOOK_SECRET=WahphdJNfwuUYaqGG3DwMVQd
```

### Optional:

```
SUPERMEMORY_API_KEY=...
LEGACY_ASSISTANT_ID=asst_NZtoNWLUW58mWYXLXxV6xeR5
```

---

## 🪝 WEBHOOKS

### Vercel Webhook:

- **URL:** `https://nexifyai-pascals-asistent.vercel.app/api/webhooks/vercel`
- **Secret:** `WahphdJNfwuUYaqGG3DwMVQd`
- **Events:** Alle Deployment & Alert Events
- **Verification:** SHA1 HMAC Signature

---

## 📝 GELÖSTE PROBLEME

### 1. Zod/AI SDK Konflikt (2026-01-10)

**Problem:** `zod@3.25.x` hat neue Struktur, `zod-to-json-schema` erwartet alten Export
**Lösung:** AI SDK komplett entfernt, direkt OpenAI SDK verwendet

### 2. Vercel Monorepo Deploy (2026-01-10)

**Problem:** Vercel fand falsche `.next` im Root
**Lösung:** `rootDirectory: "apps/dashboard"` in Root `vercel.json`

### 3. Tailwind Classes nicht geladen (2026-01-10)

**Problem:** `content` Pfade zeigten auf `./src/` statt `./app/`
**Lösung:** Pfade korrigiert zu `./app/**/*`, `./components/**/*`

---

## 🔮 NÄCHSTE SCHRITTE

1. [ ] Chat UI online testen
2. [ ] RAG mit Qdrant implementieren
3. [ ] Besseres UI Template (shadcn) evaluieren
4. [ ] MCP Server Repository erstellen
5. [ ] Memory/Learning System ausbauen

---

## 👤 USER PRÄFERENZEN (Pascal)

- Sprache: Deutsch
- Priorität: Schnelle, funktionierende Lösungen
- Stil: Direkt, keine unnötigen Erklärungen
- Erwartung: IST-Analyse vor Änderungen
- Templates: Open-Source bevorzugt
