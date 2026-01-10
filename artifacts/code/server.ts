/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamObject, zodSchema } from "ai";
import { z } from "zod";
import { codePrompt, updateDocumentPrompt } from "../../lib/ai/prompts";
import { getArtifactModel } from "../../lib/ai/providers";
import { createDocumentHandler } from "../../lib/artifacts/server";

const codeSchema = z.object({
  code: z.string(),
});

type CodeObject = z.infer<typeof codeSchema>;

export const codeDocumentHandler = createDocumentHandler<"code">({
  kind: "code",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: getArtifactModel() as any,
      system: codePrompt,
      prompt: title,
      schema: zodSchema(codeSchema as any),
    });

    for await (const delta of fullStream) {
      if (delta.type === "object") {
        const obj = delta.object as CodeObject | undefined;
        const code = obj?.code;
        if (code) {
          dataStream.writeData({ type: "data-codeDelta", data: code });
          draftContent = code;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: getArtifactModel() as any,
      system: updateDocumentPrompt(document.content, "code"),
      prompt: description,
      schema: zodSchema(codeSchema as any),
    });

    for await (const delta of fullStream) {
      if (delta.type === "object") {
        const obj = delta.object as CodeObject | undefined;
        const code = obj?.code;
        if (code) {
          dataStream.writeData({ type: "data-codeDelta", data: code });
          draftContent = code;
        }
      }
    }

    return draftContent;
  },
});
