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

### 2. EINFACHSTER WEG ZUERST ⭐ NEU

- **ERST** schnell zum Laufen bringen
- **DANN** auf Soll-Zustand bringen (IMMER, keine Ausnahme!)
- Nicht overengineeren beim ersten Versuch
- Iterativ verbessern

### 3. Templates & Blueprints nutzen

- **NIEMALS** alles selbst neu entwickeln
- **IMMER** zuerst nach Open-Source Templates suchen
- Nur kostenfreie/Open-Source Lösungen
- Bevorzugte Quellen:
  - GitHub Trending/Explore
  - Vercel Templates
  - shadcn/ui Components
  - T3 Stack / Create-Next-App

### 4. Sprache

- Mit Pascal: **DEUTSCH**
- Code/Kommentare: Englisch

### 5. Aufgeschobene Aufgaben dokumentieren

- Aufgaben die später gemacht werden sollen → `SPÄTER_TODO.md`
- Nichts vergessen!

---

## 📁 PROJEKT-STRUKTUR

```
nexify-ai-os/
├── apps/
│   └── dashboard/               # ⭐ HAUPT-APP (Next.js 16)
│       ├── app/
│       │   ├── page.tsx         # Landing Page
│       │   ├── chat/page.tsx    # Chat UI
│       │   └── api/
│       │       ├── chat/        # OpenAI Chat Streaming
│       │       ├── mcp/         # MCP Tools
│       │       └── webhooks/    # Vercel Webhooks
│       ├── lib/
│       ├── components/
│       ├── .vercel/             # Vercel CLI Config
│       ├── vercel.json
│       └── package.json
├── templates/                   # Geklonte Design-Templates
│   ├── landing-page/
│   └── backend-elemente/
├── PROJEKT_REGELN.md           # ⭐ DIESE DATEI
├── BRAIN_KNOWLEDGE.md          # Aktuelles Wissen
├── SPÄTER_TODO.md              # Aufgeschobene Aufgaben
└── nexify-ai-assietenten-api-keys.txt
```

---

## 🌐 AKTUELLE URLS

| Was            | URL                                            |
| -------------- | ---------------------------------------------- |
| Landing Page   | https://dashboard-six-tawny-72.vercel.app/     |
| Chat App       | https://dashboard-six-tawny-72.vercel.app/chat |
| Vercel Projekt | pascals-projects-2864de33/dashboard            |

---

## ⚙️ VERCEL DEPLOYMENT

### Aktuelle Konfiguration:

**`apps/dashboard/vercel.json`:**

```json
{
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build",
  "framework": "nextjs"
}
```

### Wichtig:

- ✅ npm verwenden (nicht pnpm wegen ERR_INVALID_THIS Bug)
- ✅ `--legacy-peer-deps` für Dependency-Konflikte
- ✅ Deploy von `apps/dashboard` aus

---

## 🔧 TECH STACK

| Komponente      | Technologie         | Version |
| --------------- | ------------------- | ------- |
| Framework       | Next.js             | 16.1.1  |
| Runtime         | React               | 19.x    |
| Styling         | Tailwind CSS        | 4.x     |
| AI              | OpenAI SDK (direkt) | 6.x     |
| Database        | Postgres (Drizzle)  | -       |
| Vector DB       | Qdrant              | -       |
| Package Manager | npm (für Vercel)    | -       |

### NICHT VERWENDEN:

- ❌ Vercel AI SDK (`ai`, `@ai-sdk/*`) - Zod Konflikt!
- ❌ `zod-to-json-schema` - Inkompatibel mit zod 3.25+
- ❌ pnpm auf Vercel - ERR_INVALID_THIS Bug

---

## 🔑 CREDENTIALS

Vollständige Liste: `nexify-ai-assietenten-api-keys.txt`

### Wichtigste:

```
Vercel-Token: (siehe nexify-ai-assietenten-api-keys.txt)
GitHub-Token: (siehe nexify-ai-assietenten-api-keys.txt)
Webhook-Secret: (siehe nexify-ai-assietenten-api-keys.txt)
```

---

## 📝 GELÖSTE PROBLEME

### 1. Zod/AI SDK Konflikt (2026-01-10)

**Problem:** `zod@3.25.x` hat neue Struktur, `zod-to-json-schema` erwartet alten Export
**Lösung:** AI SDK komplett entfernt, direkt OpenAI SDK verwendet

### 2. Vercel pnpm Bug (2026-01-10)

**Problem:** `ERR_INVALID_THIS` bei pnpm install auf Vercel
**Lösung:** npm statt pnpm verwenden

### 3. Tailwind Classes nicht geladen (2026-01-10)

**Problem:** `content` Pfade zeigten auf `./src/` statt `./app/`
**Lösung:** Pfade korrigiert zu `./app/**/*`, `./components/**/*`

---

## 👤 USER PRÄFERENZEN (Pascal)

- Sprache: Deutsch
- Priorität: Schnelle, funktionierende Lösungen
- Stil: Direkt, keine unnötigen Erklärungen
- **NEU:** Einfachster Weg zuerst, dann Soll-Zustand
- Templates: Open-Source bevorzugt
