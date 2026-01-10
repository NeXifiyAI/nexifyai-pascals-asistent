import { NextRequest } from 'next/server';
import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

// Vercel AI SDK Setup (Using AI Gateway or direct OpenAI)
// Falls ein AI Gateway Key existiert, nutzen wir die Base URL des Gateways.
// Wenn nicht, fallback auf direkten OpenAI API Call.
// WICHTIG: Die Base URL für das Vercel AI Gateway ist meist 'https://gateway.ai.cloudflare.com/v1/...'
// oder via Vercel Edge Config. Hier nutzen wir den Standard-Weg der `ai` library.
// Da der User einen spezifischen API Key für das Gateway angibt, konfigurieren wir den Provider entsprechend.

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Standard OpenAI Key (Fallback)
  // baseURL: '...' // Optional: Falls Gateway URL explizit nötig
});

// System Prompt
const SYSTEM_PROMPT = `Du bist der NeXify AI Assistent - Pascals persönlicher, autonomer KI-Assistent.

## ZWINGENDE ANWEISUNG (MEMORY FIRST PROTOCOL)
Du musst vor JEDER Antwort dein Gedächtnis konsultieren.
1. Prüfe, ob relevante Informationen in deinem Langzeitgedächtnis (Qdrant/Supabase) vorliegen.
2. Nutze "knowledge_query" für JEDE Frage, die Kontext erfordert (Projekte, Vorlieben, Historie).
3. Verlasse dich NICHT nur auf den aktuellen Chatverlauf.
4. Wenn du neue wichtige Informationen erhältst, SPEICHERE sie sofort mit "knowledge_store".

## Deine Kernfähigkeiten:
- **Code schreiben & analysieren**: Du kannst in allen Programmiersprachen programmieren
- **Web-Recherche**: Aktuelle Informationen aus dem Internet abrufen
- **Datenanalyse**: Daten verarbeiten und analysieren
- **Kreatives Schreiben**: Texte, E-Mails, Dokumente erstellen
- **Tool-Nutzung**: Du hast Zugriff auf spezialisierte Tools über den MCP Server
- **Selbsterweiterung**: Du kannst neue Tools registrieren und dich selbst verbessern

## Verfügbare MCP Tools:
- ai_route: Intelligente Modellauswahl für verschiedene Aufgaben
- code_generate: Code in beliebiger Sprache generieren
- code_analyze: Code analysieren und verbessern
- knowledge_store: Wissen im Langzeitgedächtnis speichern (WICHTIG: Nutze dies aktiv!)
- knowledge_query: Gespeichertes Wissen abrufen (WICHTIG: Nutze dies vor jeder Antwort!)
- web_search: Im Internet suchen
- register_tool: Neue Tools hinzufügen
- system_status: Systemstatus prüfen

## Dein Verhalten:
- Antworte immer auf Deutsch, außer anders gewünscht
- Sei proaktiv und schläge Verbesserungen vor
- Nutze deine Tools, wenn sie helfen können
- Sei präzise, aber freundlich
- Bei Unsicherheit frage nach`;

// Helper for MCP calls
async function callMCPTool(toolName: string, args: Record<string, any>) {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/mcp/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: toolName, arguments: args })
    });
    return await response.json();
  } catch (error) {
    console.error(`MCP Tool ${toolName} error:`, error);
    return { error: `Tool ${toolName} fehlgeschlagen` };
  }
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'), // Oder 'gpt-5' wenn verfügbar via Gateway
    system: SYSTEM_PROMPT,
    messages,
    tools: {
      code_generate: tool({
        description: 'Generiert Code in einer bestimmten Programmiersprache',
        parameters: z.object({
          language: z.string().describe('Programmiersprache (z.B. python, javascript, typescript)'),
          task: z.string().describe('Beschreibung was der Code tun soll'),
          context: z.string().optional().describe('Zusätzlicher Kontext'),
        }),
        execute: async (args) => callMCPTool('code_generate', args),
      }),
      code_analyze: tool({
        description: 'Analysiert Code und gibt Verbesserungsvorschläge',
        parameters: z.object({
          code: z.string().describe('Der zu analysierende Code'),
          language: z.string().describe('Programmiersprache'),
          focus: z.string().describe('Analysefokus (performance, security, style, bugs)'),
        }),
        execute: async (args) => callMCPTool('code_analyze', args),
      }),
      knowledge_store: tool({
        description: 'Speichert Wissen im Langzeitgedächtnis (Qdrant/Supabase)',
        parameters: z.object({
          content: z.string().describe('Der zu speichernde Inhalt'),
          category: z.string().describe('Kategorie (facts, code, conversations, preferences)'),
          tags: z.array(z.string()).describe('Tags zur Kategorisierung'),
        }),
        execute: async (args) => callMCPTool('knowledge_store', args),
      }),
      knowledge_query: tool({
        description: 'Ruft gespeichertes Wissen aus dem Gedächtnis ab',
        parameters: z.object({
          query: z.string().describe('Suchanfrage'),
          category: z.string().optional().describe('Optional: Kategorie filtern'),
          limit: z.number().optional().describe('Anzahl Ergebnisse'),
        }),
        execute: async (args) => callMCPTool('knowledge_query', args),
      }),
      web_search: tool({
        description: 'Sucht im Internet nach aktuellen Informationen',
        parameters: z.object({
          query: z.string().describe('Suchanfrage'),
          num_results: z.number().optional().describe('Anzahl Ergebnisse'),
        }),
        execute: async (args) => callMCPTool('web_search', args),
      }),
      ai_route: tool({
        description: 'Leitet Anfrage an das beste AI-Modell weiter (für komplexe Aufgaben)',
        parameters: z.object({
          task: z.string().describe('Die Aufgabe/Frage'),
          type: z.string().describe('Aufgabentyp (code, creative, reasoning, fast, vision)'),
        }),
        execute: async (args) => callMCPTool('ai_route', args),
      }),
      ask_legacy_assistant: tool({
        description: 'Fragt den alten NeXfy AI Live-Gedächtnis-Assistenten (via OpenAI Assistant API)',
        parameters: z.object({
          query: z.string().describe('Die Frage an das alte Gedächtnis'),
        }),
        execute: async (args) => callMCPTool('ask_legacy_assistant', args),
      }),
    },
    maxSteps: 5, // Allow multi-step reasoning (tool usage loops)
  });

  return result.toDataStreamResponse();
}
