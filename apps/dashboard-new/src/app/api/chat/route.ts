import { deepseek } from "@ai-sdk/deepseek";
import { streamText, tool } from "ai";
import { getBrainLoader } from "@/lib/brain/supabase-loader";
import {
  handleCodeGenerate,
  handleCodeAnalyze,
  handleKnowledgeStore,
  handleKnowledgeQuery,
} from "@/lib/mcp/handlers";
import { z } from "zod";

const SYSTEM_PROMPT = `Du bist der NeXify AI Assistent - Pascals persönlicher, autonomer KI-Assistent.
Betrieben mit DeepSeek für überlegene Effizienz und Kosteneffektivität.

## KRITISCHE REGEL - PROAKTIVE OPTIMIERUNG (PFLICHT!):
Bei JEDER Aufgabe MUSST du:
1. SOFORT auf schnellere, effektivere und fehlerfreiere Lösungen hinweisen
2. NICHT warten bis Pascal fragt - PROAKTIV bessere Wege vorschlagen
3. Bei autonomem Arbeiten: Beste Lösung DIREKT anwenden
4. Beispiele für bessere Lösungen:
   - Docker statt manuelle Setups → weniger Fehler
   - Open Source Pakete statt selbst coden → schneller
   - Ein Tool statt mehrere → einfacher (z.B. Biome statt ESLint+Prettier)
   - pnpm statt npm → schneller, weniger Speicher
5. IMMER zuerst prüfen: Gibt es einen schnelleren/besseren Weg?

## Deine Kernfähigkeiten:
- Code schreiben & analysieren in allen Programmiersprachen
- Wissen speichern & abrufen aus Pascals Brain (Supabase PostgreSQL + pgvector)
- Datenanalyse: Daten verarbeiten und analysieren
- Kreatives Schreiben: Texte, E-Mails, Dokumente erstellen

## WICHTIG - TOOL-NUTZUNG IST PFLICHT:
Du MUSST deine Tools bei JEDER relevanten Anfrage nutzen!

### Wann nutze ich welches Tool?

1. **knowledge_query** - IMMER wenn der User fragt:
   - "Was weißt du über...?"
   - "Teste deine Brain-Zugriffe"
   - "Zeig mir was du über X gespeichert hast"
   - "Erinnere dich an..."
   → Nutze knowledge_query({ query: "...", limit: 5 })

2. **knowledge_store** - IMMER wenn der User:
   - Neue Informationen teilt
   - Seine Präferenzen äußert
   - Projekt-Details beschreibt
   → Nutze knowledge_store({ content: "...", category: "facts" })

3. **code_generate** - Wenn der User:
   - "Schreib Code für..."
   - "Generiere eine Funktion..."
   - "Erstelle ein Script..."
   → Nutze code_generate({ language: "...", task: "..." })

4. **code_analyze** - Wenn der User:
   - Code zur Review schickt
   - "Analysiere diesen Code"
   - "Finde Bugs in..."
   → Nutze code_analyze({ code: "...", focus: "all" })

## BEISPIEL - Wenn User sagt "Teste deine Zugriffe":
1. Rufe knowledge_query auf mit query: "Pascal Courbois NeXify"
2. Zeige die Ergebnisse
3. Erkläre was du gefunden hast

## Dein Verhalten:
- Antworte auf Deutsch
- Nutze Tools PROAKTIV - nicht erst wenn der User explizit danach fragt
- Zeige IMMER wenn du ein Tool nutzt
- Bei Unsicherheit: Nutze knowledge_query um nachzusehen
- Erwähne bei Bedarf dass du mit DeepSeek betrieben wirst

## Dein Wissen:
Du hast Zugriff auf Pascals Brain - eine Supabase PostgreSQL Datenbank mit pgvector für semantische Suche.
Features: Zwangsladung (auto_load), Realtime Updates, Error Tracking, Learned Patterns.

REGEL: Wenn der User nach deinen "Zugriffen" oder "Tools" fragt, nutze sie SOFORT um zu beweisen dass sie funktionieren!
`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Helper: Embedding generieren via OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-ada-002",
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI Embedding Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Brain-Kontext laden basierend auf der letzten User-Nachricht
  const lastUserMessage = messages[messages.length - 1].content;
  let brainContext = "";

  try {
    const brainLoader = getBrainLoader("nexify-ai");

    // Mandatory context laden (immer)
    const mandatory = await brainLoader.getMandatoryContext();

    // Semantische Suche nur wenn Supabase konfiguriert ist
    let relevant: any[] = [];
    if (process.env.OPENAI_API_KEY) {
      try {
        const embedding = await generateEmbedding(lastUserMessage);
        relevant = await brainLoader.searchMemories(embedding, {
          limit: 5,
          threshold: 0.7,
        });
      } catch (embeddingError) {
        console.warn(
          "Embedding generation failed, using mandatory only:",
          embeddingError,
        );
      }
    }

    // Context formatieren
    const context = brainLoader.formatContextForPrompt({
      mandatory,
      relevant,
      errors: [],
      total_tokens_estimate: 0,
      loaded_at: new Date().toISOString(),
    });

    brainContext = context;
    console.log(
      `Brain: ${mandatory.length} mandatory + ${relevant.length} relevant memories loaded`,
    );
  } catch (e) {
    console.error("Failed to load brain context:", e);
  }

  const systemPromptWithBrain = brainContext
    ? `${SYSTEM_PROMPT}\n\n## RELEVANTE ERINNERUNGEN AUS PASCALS BRAIN:\n${brainContext}\n\nNutze diese Informationen, um die Antwort zu personalisieren.`
    : SYSTEM_PROMPT;

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: systemPromptWithBrain,
    messages,
    maxSteps: 5, // Allow up to 5 tool roundtrips
    tools: {
      code_generate: tool({
        description: "Generate code in any programming language",
        parameters: z.object({
          language: z.string().describe("Programming language"),
          task: z.string().describe("What the code should do"),
          context: z.string().optional().describe("Additional context"),
        }),
        execute: async ({ language, task, context }) => {
          return await handleCodeGenerate({ language, task, context });
        },
      }),
      code_analyze: tool({
        description: "Analyze code for bugs, security issues, and improvements",
        parameters: z.object({
          code: z.string().describe("Code to analyze"),
          language: z.string().optional().describe("Programming language"),
          focus: z
            .enum(["performance", "security", "style", "bugs", "all"])
            .optional()
            .describe("Analysis focus"),
        }),
        execute: async ({ code, language, focus }) => {
          return await handleCodeAnalyze({ code, language, focus });
        },
      }),
      knowledge_store: tool({
        description: "Store knowledge in long-term memory",
        parameters: z.object({
          content: z.string().describe("Content to store"),
          category: z
            .enum(["facts", "code", "conversations", "preferences"])
            .describe("Category"),
          tags: z.array(z.string()).optional().describe("Tags"),
          is_active: z.boolean().optional().describe("Is current truth"),
        }),
        execute: async ({ content, category, tags, is_active }) => {
          return await handleKnowledgeStore({
            content,
            category,
            tags,
            is_active,
          });
        },
      }),
      knowledge_query: tool({
        description: "Query stored knowledge from memory",
        parameters: z.object({
          query: z.string().describe("Search query"),
          category: z.string().optional().describe("Filter by category"),
          limit: z.number().optional().describe("Number of results"),
        }),
        execute: async ({ query, category, limit }) => {
          return await handleKnowledgeQuery({ query, category, limit });
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
