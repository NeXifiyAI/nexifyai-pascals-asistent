import type { Suggestion } from "./db/schema";

export type DataPart = { type: "append-message"; message: string };

export type MessageMetadata = {
  createdAt: string;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: "text" | "code" | "image" | "sheet";
  clear: null;
  finish: null;
  "chat-title": string;
};

// Simple ChatMessage type (no AI SDK dependency)
export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
  parts?: any[];
  createdAt?: Date;
  metadata?: MessageMetadata;
};

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
