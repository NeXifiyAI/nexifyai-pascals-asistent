import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Simple formatISO replacement to avoid date-fns dependency
function formatISO(date: Date): string {
  return date.toISOString();
}
import type { DBMessage, Document } from "./db/schema";
import { ChatSDKError, type ErrorCode } from "./errors";
import type { ChatMessage, CustomUIDataTypes } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const { code, cause } = await response.json();
    throw new ChatSDKError(code as ErrorCode, cause);
  }

  return response.json();
};

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { code, cause } = await response.json();
      throw new ChatSDKError(code as ErrorCode, cause);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ChatSDKError("offline:chat");
    }

    throw error;
  }
}

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Simple message type (no AI SDK dependency)
interface SimpleMessage {
  id: string;
  role: "user" | "assistant" | "system" | "data" | "tool";
  content: string;
}

export function getMostRecentUserMessage(messages: SimpleMessage[]) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Document[],
  index: number,
) {
  if (!documents) {
    return new Date();
  }
  if (index > documents.length) {
    return new Date();
  }

  return documents[index].createdAt;
}

export function getTrailingMessageId({
  messages,
}: {
  messages: SimpleMessage[];
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) {
    return null;
  }

  return trailingMessage.id;
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant" | "system" | "data",
    content: "", // Add default content string
    parts: message.parts as any, // Use any to bypass type issues during migration
    createdAt: message.createdAt,
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  })) as ChatMessage[];
}

export function getTextFromMessage(message: ChatMessage): string {
  if (message.content) return message.content;

  if (message.parts) {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as { type: "text"; text: string }).text)
      .join("");
  }
  return "";
}
