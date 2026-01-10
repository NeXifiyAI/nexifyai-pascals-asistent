# NeXifyAI - AI Team Brain Knowledge Base
**GESICHERT: ${new Date().toISOString()}**

## SYSTEMSTATUS
- **Projekt**: NeXifyAI Autonomer KI-Assistent
- **Phase**: Build-Completion & Type-Migration (ai-sdk v4→v6)
- **Deadline**: Heute 19:00 Uhr
- **Autonomie**: VOLL AKTIVIERT

## ABGESCHLOSSENE AUFGABEN

### 1. Dependency Installation ✅
- ✅ papaparse + @types/papaparse
- ✅ lucide-react  
- ✅ @xyflow/react
- ✅ shiki
- ✅ framer-motion, cmdk, class-variance-authority, clsx, nanoid, next-themes, swr, tailwind-merge, usehooks-ts, streamdown
- ✅ CodeMirror: @codemirror/lang-{javascript,html,css,python}, @codemirror/state, @codemirror/theme-one-dark, @codemirror/view
- ✅ ProseMirror: prosemirror-{state,view,model,schema-basic,schema-list,inputrules,example-setup,markdown}

### 2. Type-Fixes ✅
- ✅ `components/ai-elements/confirmation.tsx` - ToolUIPart lokal definiert
- ✅ `components/ai-elements/image.tsx` - ImageProps erweitert (mediaType, base64, uint8Array)
- ✅ `components/ai-elements/message.tsx` - FileUIPart + UIMessage lokal definiert
- ✅ `components/ai-elements/prompt-input.tsx` - ChatStatus + FileUIPart lokal definiert
- ✅ `components/ai-elements/shimmer.tsx` - motion/react → framer-motion
- ✅ `components/ai-elements/tool.tsx` - ToolUIPart vollständig definiert (input, output, errorText)
- ✅ `components/elements/tool.tsx` - ToolUIPart vollständig definiert
- ✅ `components/artifact-messages.tsx` - UseChatHelpers Generic entfernt
- ✅ `components/artifact.tsx` - UseChatHelpers Generic entfernt
- ✅ 8 Dateien: UseChatHelpers<ChatMessage> → UseChatHelpers (sed batch)
- ✅ `components/chat.tsx` - DefaultChatTransport entfernt, useChat API vereinfacht
- ✅ `components/create-artifact.tsx` + `data-stream-provider.tsx` - DataUIPart lokal definiert

### 3. AI-SDK Compatibility Layer ✅
- ✅ `lib/ai-sdk-compat.ts` erstellt mit:
  - ExtendedUseChatHelpers (sendMessage, regenerate, resumeStream, addToolApprovalResponse)
  - ChatStatus, FileUIPart, ToolUIPart, DataUIPart, UIMessage Types

## AKTUELLE AUFGABE
**Build-Blocker beheben**: Property 'sendMessage' does not exist on type 'UseChatHelpers'

**NEXT STEPS**:
1. Alle Component-Imports auf `lib/ai-sdk-compat` umstellen
2. Build erfolgreich durchführen
3. Git Commit + Push
4. MCP-Server Repository erstellen
5. MyDispatch + Cavantooo fertigstellen

## PROJEKTSTRUKTUR

### NeXifyAI
```
nexifyai-pascals-assistent/
├── app/                    # Next.js App Router
├── components/             # UI Components
├── artifacts/              # Artifact Handlers (code, sheet, text)
├── lib/                    # Utilities & Helpers
│   ├── ai-sdk-compat.ts   # AI SDK v4 Compatibility Layer
│   └── artifacts/         # Artifact Server Logic
├── package.json
└── next.config.js
```

### MyDispatch
- Status: PENDING - Analyse erforderlich
- Location: TBD

### Cavantooo & OpenCarBox  
- Status: PENDING - Analyse erforderlich
- Location: TBD

## TECHNISCHE DETAILS

### AI SDK Migration Strategy
**Problem**: ai-sdk wurde von v4 auf v6 aktualisiert, aber das Projekt verwendet v4 API
**Lösung**: 
1. Compatibility Layer (`lib/ai-sdk-compat.ts`) als Zwischenschritt
2. Alle fehlenden Types lokal definieren
3. Deprecated Methods als `any` markieren für späteren Refactor
4. TODO-Kommentare für zukünftige Migration

### Build-Fehler Pattern
**Pattern**: `Type 'UseChatHelpers' is not generic`
**Fix**: UseChatHelpers<ChatMessage> → UseChatHelpers

**Pattern**: `Module '"ai"' has no exported member 'XXX'`
**Fix**: Lokale Type-Definition oder Compatibility Layer

## SSH & GITHUB
- ✅ SSH Key: ~/.ssh/nexifyai_deploy_key (ed25519)
- ✅ GitHub Remote: git@github.com:NeXifiyAI/nexifyai-pascals-asistent.git
- ✅ Token: [HIDDEN]


## MCP-SERVER ARCHITEKTUR
```
nexifyai-mcp-server/
├── tools/
│   ├── github-tool.ts      # GitHub API Integration
│   ├── browser-tool.ts     # Playwright Browser Control
│   ├── biome-tool.ts       # Code Formatting/Linting
│   └── memory-tool.ts      # Qdrant Vector Memory
├── agents/
│   ├── code-agent.ts       # Code Generation Agent
│   ├── research-agent.ts   # Web Research Agent
│   └── orchestrator.ts     # Agent Coordination
└── server.ts               # MCP Server Entry Point
```

## ZEITPLAN
- **JETZT - 15:00**: Build fertigstellen
- **15:00 - 16:00**: Git Commit + MCP Server Setup
- **16:00 - 17:30**: MyDispatch fertigstellen
- **17:30 - 19:00**: Cavantooo & OpenCarBox fertigstellen

**STATUS: AUTONOMER MODUS - KEIN STOPP BIS 19:00 UHR**
