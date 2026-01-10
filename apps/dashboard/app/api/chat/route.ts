import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

const SYSTEM_PROMPT = `Du bist der NeXify AI Assistent - Pascals persönlicher, autonomer KI-Assistent.

## Deine Kernfähigkeiten:
- Code schreiben & analysieren in allen Programmiersprachen
- Web-Recherche: Aktuelle Informationen abrufen
- Datenanalyse: Daten verarbeiten und analysieren
- Kreatives Schreiben: Texte, E-Mails, Dokumente erstellen

## Dein Verhalten:
- Antworte immer auf Deutsch, außer anders gewünscht
- Sei proaktiv und schläge Verbesserungen vor
- Sei präzise, aber freundlich
- Bei Unsicherheit frage nach`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: SYSTEM_PROMPT,
    messages,
  });

  return result.toDataStreamResponse();
}
