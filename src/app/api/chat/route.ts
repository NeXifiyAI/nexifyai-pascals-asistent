import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `Du bist der NeXify AI Assistent - Pascals persönlicher, autonomer KI-Assistent.

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
- knowledge_store: Wissen im Langzeitgedächtnis speichern
- knowledge_query: Gespeichertes Wissen abrufen
- web_search: Im Internet suchen
- register_tool: Neue Tools hinzufügen
- system_status: Systemstatus prüfen

## Dein Verhalten:
- Antworte immer auf Deutsch, außer anders gewünscht
- Sei proaktiv und schläge Verbesserungen vor
- Nutze deine Tools, wenn sie helfen können
- Sei präzise, aber freundlich
- Bei Unsicherheit frage nach`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

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

export async function POST(request: NextRequest) {
  try {
    const { messages, tools } = await request.json();
    
    // Build conversation with system prompt
    const conversationMessages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    // Define available functions for OpenAI
    const functions = [
      {
        name: 'code_generate',
        description: 'Generiert Code in einer bestimmten Programmiersprache',
        parameters: {
          type: 'object',
          properties: {
            language: { type: 'string', description: 'Programmiersprache (z.B. python, javascript, typescript)' },
            task: { type: 'string', description: 'Beschreibung was der Code tun soll' },
            context: { type: 'string', description: 'Zusätzlicher Kontext' }
          },
          required: ['language', 'task']
        }
      },
      {
        name: 'code_analyze',
        description: 'Analysiert Code und gibt Verbesserungsvorschläge',
        parameters: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'Der zu analysierende Code' },
            language: { type: 'string', description: 'Programmiersprache' },
            focus: { type: 'string', description: 'Analysefokus (performance, security, style, bugs)' }
          },
          required: ['code']
        }
      },
      {
        name: 'knowledge_store',
        description: 'Speichert Wissen im Langzeitgedächtnis (Qdrant)',
        parameters: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'Der zu speichernde Inhalt' },
            category: { type: 'string', description: 'Kategorie (facts, code, conversations, preferences)' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags zur Kategorisierung' }
          },
          required: ['content', 'category']
        }
      },
      {
        name: 'knowledge_query',
        description: 'Ruft gespeichertes Wissen aus dem Gedächtnis ab',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Suchanfrage' },
            category: { type: 'string', description: 'Optional: Kategorie filtern' },
            limit: { type: 'number', description: 'Anzahl Ergebnisse' }
          },
          required: ['query']
        }
      },
      {
        name: 'web_search',
        description: 'Sucht im Internet nach aktuellen Informationen',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Suchanfrage' },
            num_results: { type: 'number', description: 'Anzahl Ergebnisse' }
          },
          required: ['query']
        }
      },
      {
        name: 'ai_route',
        description: 'Leitet Anfrage an das beste AI-Modell weiter (für komplexe Aufgaben)',
        parameters: {
          type: 'object',
          properties: {
            task: { type: 'string', description: 'Die Aufgabe/Frage' },
            type: { type: 'string', description: 'Aufgabentyp (code, creative, reasoning, fast, vision)' }
          },
          required: ['task']
        }
      }
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversationMessages as any,
      functions,
      function_call: 'auto',
      max_tokens: 4096,
      temperature: 0.7
    });

    const assistantMessage = completion.choices[0].message;
    const toolCalls: Array<{ name: string; result?: any }> = [];

    // Handle function calls
    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments || '{}');
      
      // Call MCP tool
      const toolResult = await callMCPTool(functionName, functionArgs);
      toolCalls.push({ name: functionName, result: toolResult });

      // Get final response with tool result
      const followUpMessages = [
        ...conversationMessages,
        assistantMessage,
        {
          role: 'function' as const,
          name: functionName,
          content: JSON.stringify(toolResult)
        }
      ];

      const followUp = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: followUpMessages as any,
        max_tokens: 4096,
        temperature: 0.7
      });

      return NextResponse.json({
        response: followUp.choices[0].message?.content || '',
        toolCalls
      });
    }

    return NextResponse.json({
      response: assistantMessage.content || '',
      toolCalls
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: `Fehler: ${error.message}` },
      { status: 500 }
    );
  }
}
