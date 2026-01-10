"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { IconSend, IconSparkles, IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

export default function ChatPage() {
  const { updateSession, getCurrentSession, createSession, currentSessionId } =
    useChatStore();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hallo Pascal! Ich bin dein NeXify AI Assistent. Ich kann dir bei Programmierung, Recherche, Analysen und vielem mehr helfen. Was kann ich für dich tun?",
      },
    ],
    onFinish: (message) => {
      // Save to store after each message
      if (currentSessionId) {
        updateSession(currentSessionId, [...messages, message]);
      }
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load current session on mount AND when session changes
  useEffect(() => {
    const session = getCurrentSession();
    if (session && session.messages.length > 0) {
      setMessages(session.messages);
    } else if (currentSessionId) {
      // New empty session - clear messages
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hallo Pascal! Ich bin dein NeXify AI Assistent. Ich kann dir bei Programmierung, Recherche, Analysen und vielem mehr helfen. Was kann ich für dich tun?",
        },
      ]);
    } else if (!currentSessionId) {
      createSession("Neuer Chat");
    }
  }, [currentSessionId]); // React to session changes

  // Auto-save messages to current session
  useEffect(() => {
    if (currentSessionId && messages.length > 1) {
      updateSession(currentSessionId, messages);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <IconSparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <Card
                className={cn(
                  "max-w-[80%] px-4 py-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </Card>

              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <IconUser className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <IconSparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht eingeben... (Enter zum Senden, Shift+Enter für neue Zeile)"
              rows={1}
              className="min-h-[56px] resize-none pr-14"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
            >
              <IconSend className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            NeXify AI mit Vercel AI SDK - German Engineering Standards
          </p>
        </form>
      </div>
    </div>
  );
}
