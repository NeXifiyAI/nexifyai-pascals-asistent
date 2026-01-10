/**
 * AI SDK Compatibility Layer
 * Provides backward-compatible types for ai-sdk v4.x
 * TODO: Migrate to new ai-sdk v6 API
 */

import type { UseChatHelpers } from "@ai-sdk/react";

// Extend UseChatHelpers with deprecated methods that will be implemented later
export interface ExtendedUseChatHelpers extends UseChatHelpers {
  sendMessage?: (message: any) => void;
  regenerate?: () => void;
  resumeStream?: () => void;
  addToolApprovalResponse?: (params: any) => void;
}

// Custom types not exported in ai v4
export type ChatStatus = "idle" | "awaiting-input" | "streaming" | "error" | "submitted" | "ready";

export type FileUIPart = {
  type: "file-ui";
  name?: string;
  filename?: string;
  mimeType?: string;
  mediaType?: string;
  size?: number;
  url?: string;
};

export type ToolUIPartState = 
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-denied"
  | "output-available"
  | "output-error";

export type ToolUIPart = {
  type: "tool-ui";
  state: ToolUIPartState;
  content?: any;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

export type DataUIPart = any; // Placeholder for data stream parts

export type UIMessageRole = "user" | "assistant";

export type UIMessage = {
  role: UIMessageRole;
  content: string;
};
