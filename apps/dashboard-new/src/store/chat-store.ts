import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message } from "ai";

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;

  // Actions
  createSession: (title?: string) => string;
  updateSession: (sessionId: string, messages: Message[]) => void;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string) => void;
  getCurrentSession: () => ChatSession | null;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      createSession: (title = "Neuer Chat") => {
        const id = `chat-${Date.now()}`;
        const newSession: ChatSession = {
          id,
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: id,
        }));

        return id;
      },

      updateSession: (sessionId, messages) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages,
                  updatedAt: Date.now(),
                  title:
                    messages
                      .find((m) => m.role === "user")
                      ?.content?.slice(0, 50) || session.title,
                }
              : session,
          ),
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSessionId:
            state.currentSessionId === sessionId
              ? state.sessions[0]?.id || null
              : state.currentSessionId,
        }));
      },

      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },

      getCurrentSession: () => {
        const state = get();
        return (
          state.sessions.find((s) => s.id === state.currentSessionId) || null
        );
      },
    }),
    {
      name: "nexify-chat-storage",
    },
  ),
);
