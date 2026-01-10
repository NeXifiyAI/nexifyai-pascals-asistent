# 🚀 NeXify AI MCP Server

**Supreme Autonomous General Intelligence - German Engineering Standards**

Ein vollständiger MCP (Model Context Protocol) Server für das NeXify AI Ökosystem mit:
- Multi-AI Provider Routing (OpenAI, DeepSeek, OpenRouter, Hugging Face)
- Qdrant Vector Database Integration (Dual-Brain Architecture)
- Self-Extension Capabilities
- Dynamic Tool Registration
- GitHub Integration

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    NeXify AI MCP Server                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   OpenAI    │  │  DeepSeek   │  │    OpenRouter       │  │
│  │  GPT-4/4o   │  │   Coder     │  │  Claude/Llama/etc   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                         ↓                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Smart Router                          │  │
│  │     (Automatic Model Selection by Task Type)          │  │
│  └───────────────────────────────────────────────────────┘  │
│                         ↓                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Qdrant    │  │   GitHub    │  │  Dynamic Tools      │  │
│  │ Dual-Brain  │  │   Sync      │  │  Self-Extension     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Dokumentation

**Neu:** [Vollständiger GitHub Dokumentations-Leitfaden](./GITHUB_DOKUMENTATION.md) - Erfahren Sie, wo und wie Sie Projektdokumentation in GitHub finden und nutzen (Wiki, Pages, README, docs/).

Weitere Dokumentation:
- [Architektur-Details](./ARCHITECTURE.md)
- [Mission & Vision](./MISSION.md)
- [Brain Knowledge System](./BRAIN_KNOWLEDGE.md)

## 📦 Installation

```bash
# Clone
git clone https://github.com/NeXifiyAI/nexifyai-pascals-asistent.git
cd nexifyai-pascals-asistent

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Development
npm run dev

# Build
npm run build
```

## 🔧 Verfügbare Tools

### AI Provider Tools
| Tool | Beschreibung |
|------|-------------|
| `ask_openai` | GPT-4 Turbo für komplexe Reasoning-Tasks |
| `ask_deepseek` | DeepSeek für Code-Generierung (kosteneffizient) |
| `ask_openrouter` | Multi-Model Routing via OpenRouter |
| `ask_huggingface` | Spezialisierte Hugging Face Modelle |
| `smart_ask` | Automatische Modell-Auswahl nach Task-Typ |

### Qdrant Vector Database
| Tool | Beschreibung |
|------|-------------|
| `qdrant_search` | Semantische Suche in einer Collection |
| `qdrant_upsert` | Vektoren einfügen/aktualisieren |
| `qdrant_list_collections` | Alle Collections auflisten |
| `qdrant_create_collection` | Neue Collection erstellen |
| `qdrant_multi_search` | Dual-Brain Suche über mehrere Collections |

### GitHub Tools
| Tool | Beschreibung |
|------|-------------|
| `github_get_file` | Datei aus Repository lesen |
| `github_update_file` | Datei erstellen/aktualisieren |
| `github_list_files` | Dateien im Repository auflisten |

### Self-Extension Tools
| Tool | Beschreibung |
|------|-------------|
| `register_tool` | Neues Tool dynamisch registrieren |
| `list_tools` | Alle Tools auflisten |
| `remove_tool` | Dynamisches Tool entfernen |
| `add_api_integration` | Neue API-Integration hinzufügen |

### Code & Knowledge Tools
| Tool | Beschreibung |
|------|-------------|
| `generate_code` | Code generieren (verwendet DeepSeek Coder) |
| `analyze_code` | Code analysieren (Bugs, Security, Performance) |
| `store_knowledge` | Wissen in Dual-Brain speichern |
| `query_knowledge` | Wissensbasis durchsuchen |

### System Tools
| Tool | Beschreibung |
|------|-------------|
| `system_status` | System-Status und Health Metrics |
| `ask_nexify_master` | Haupt-Endpoint für NeXify AI Queries |

## 🌐 API Endpoints

### HTTP API (Vercel)

```bash
# Server Info
GET /api/mcp

# List all tools
GET /api/mcp/tools

# System status
GET /api/mcp/status

# Call a tool
POST /api/mcp/call
Content-Type: application/json
{
  "tool": "ask_openai",
  "arguments": {
    "prompt": "What is quantum computing?"
  }
}

# MCP Protocol (JSON-RPC style)
POST /api/mcp
Content-Type: application/json
{
  "method": "tools/call",
  "params": {
    "name": "ask_nexify_master",
    "arguments": {
      "query": "Explain the architecture"
    }
  }
}
```

## 🔐 Authentifizierung

Optional Bearer Token Authentication:

```bash
curl -X POST https://your-domain.vercel.app/api/mcp/call \
  -H "Authorization: Bearer YOUR_AUTH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tool": "system_status", "arguments": {}}'
```

## 🧠 Dual-Brain Architecture

Der Server implementiert die Dual-Brain Architektur:

1. **Fast Path (OpenAI Vector Store)**: Für schnelle Queries (<5s)
2. **Deep Path (Qdrant Multi-Collection)**: Für tiefe Analyse
3. **Combined**: Beide für Decision-Making

```typescript
// Beispiel: Multi-Collection Search
await toolHandlers.qdrant_multi_search({
  query: "How to implement RAG?",
  collections: ["semantic_memory", "episodic_memory", "procedural_memory"],
  limit: 3
});
```

## 🔧 Self-Extension Beispiel

```typescript
// Neues Tool registrieren
await toolHandlers.register_tool({
  name: "custom_calculator",
  description: "Simple calculator",
  inputSchema: {
    type: "object",
    properties: {
      a: { type: "number" },
      b: { type: "number" },
      op: { type: "string" }
    },
    required: ["a", "b", "op"]
  },
  handler_code: `
    const { a, b, op } = args;
    switch(op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return a / b;
      default: return 'Unknown operation';
    }
  `
});
```

## 🔌 Neue API Integration hinzufügen

```typescript
await toolHandlers.add_api_integration({
  name: "weather",
  base_url: "https://api.weather.com",
  api_key: "your-weather-api-key",
  endpoints: [
    {
      name: "current",
      method: "GET",
      path: "/v1/current",
      description: "Get current weather"
    },
    {
      name: "forecast",
      method: "GET",
      path: "/v1/forecast",
      description: "Get weather forecast"
    }
  ]
});

// Dann verwendbar als:
await toolHandlers.weather_current({ params: { city: "Berlin" } });
```

## 📊 Environment Variables

| Variable | Beschreibung |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API Key |
| `OPENROUTER_API_KEY` | OpenRouter API Key |
| `DEEPSEEK_API_KEY` | DeepSeek API Key |
| `HUGGINGFACE_API_KEY` | Hugging Face API Key |
| `QDRANT_URL` | Qdrant Cluster URL |
| `QDRANT_API_KEY` | Qdrant API Key |
| `GITHUB_TOKEN` | GitHub Personal Access Token |
| `AUTH_SECRET` | Optional: Bearer Token für API-Auth |

## 🚀 Deployment auf Vercel

1. Push zu GitHub
2. Import in Vercel
3. Environment Variables in Vercel Dashboard setzen
4. Deploy!

```bash
# Oder via CLI
vercel --prod
```

## 📝 License

MIT License - NeXify AI 2026
