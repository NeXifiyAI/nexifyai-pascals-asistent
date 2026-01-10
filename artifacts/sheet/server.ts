/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamObject, zodSchema } from "ai";
import { z } from "zod";
import { sheetPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { getArtifactModel } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

const sheetSchema = z.object({
  csv: z.string().describe("CSV data"),
});

type SheetObject = z.infer<typeof sheetSchema>;

export const sheetDocumentHandler = createDocumentHandler<"sheet">({
  kind: "sheet",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: getArtifactModel() as any,
      system: sheetPrompt,
      prompt: title,
      schema: zodSchema(sheetSchema as any),
    });

    for await (const delta of fullStream) {
      if (delta.type === "object") {
        const obj = delta.object as SheetObject | undefined;
        const csv = obj?.csv;
        if (csv) {
          dataStream.writeData({ type: "data-sheetDelta", data: csv });
          draftContent = csv;
        }
      }
    }

    dataStream.writeData({ type: "data-sheetDelta", data: draftContent });

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: getArtifactModel() as any,
      system: updateDocumentPrompt(document.content, "sheet"),
      prompt: description,
      schema: zodSchema(sheetSchema as any),
    });

    for await (const delta of fullStream) {
      if (delta.type === "object") {
        const obj = delta.object as SheetObject | undefined;
        const csv = obj?.csv;
        if (csv) {
          dataStream.writeData({ type: "data-sheetDelta", data: csv });
          draftContent = csv;
        }
      }
    }

    return draftContent;
  },
});
