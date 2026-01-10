import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { loadBrainContext } from "@/lib/brain/loader";
import {
  handleCodeGenerate,
  handleCodeAnalyze,
  handleKnowledgeStore,
  handleKnowledgeQuery,
} from "@/lib/mcp/handlers";
import { z } from "zod";

const SYSTEM_PROMPT = `Du bist der NeXify AI Assistent - Pascals persönlicher, autonomer KI-Assistent.

## Deine Kernfähigkeiten:
- Code schreiben & analysieren in allen Programmiersprachen (nutze code_generate & code_analyze Tools!)
- Wissen speichern & abrufen (nutze knowledge_store & knowledge_query Tools!)
- Datenanalyse: Daten verarbeiten und analysieren
- Kreatives Schreiben: Texte, E-Mails, Dokumente erstellen

## Dein Verhalten:
- Antworte immer auf Deutsch, außer anders gewünscht
- Nutze deine Tools AKTIV - speichere wichtige Informationen automatisch!
- Sei proaktiv und schläge Verbesserungen vor
- Sei präzise, aber freundlich
- Bei Unsicherheit frage nach

## Dein Wissen:
Du hast Zugriff auf Pascals Brain - eine Wissensdatenbank mit seinen Projekten, Präferenzen und wichtigen Informationen.

## WICHTIG: Tool-Nutzung
- Speichere ALLE neuen Erkenntnisse über Pascal automatisch mit knowledge_store
- Nutze code_generate für Code-Aufgaben
- Nutze code_analyze für Code-Reviews
`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Brain-Kontext laden basierend auf der letzten User-Nachricht
  const lastUserMessage = messages[messages.length - 1].content;
  let brainContext = "";

  try {
    brainContext = await loadBrainContext(lastUserMessage);
  } catch (e) {
    console.error("Failed to load brain context", e);
  }

  const systemPromptWithBrain = brainContext
    ? `${SYSTEM_PROMPT}\n\n## RELEVANTE ERINNERUNGEN AUS PASCALS BRAIN:\n${brainContext}\n\nNutze diese Informationen, um die Antwort zu personalisieren.`
    : SYSTEM_PROMPT;

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPromptWithBrain,
    messages,
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
