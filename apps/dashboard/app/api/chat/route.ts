import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    stream: true,
  });

  // Create a ReadableStream for the response
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
