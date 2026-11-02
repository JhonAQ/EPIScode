"use client";

import { useCallback, useRef, useState } from "react";
import type { ApiResponse, ChatMessage, ChatResponse, ChatSource } from "@/types";

const MAX_CONVERSATION_MESSAGES = 20;

/** Mensaje tal como lo pinta la UI: el del API más las fuentes (solo en respuestas del asistente). */
export interface UiMessage extends ChatMessage {
  sources?: ChatSource[];
}

export interface UseChatResult {
  messages: UiMessage[];
  loading: boolean;
  error: string | null;
  /** Envía una pregunta del usuario y agrega la respuesta a `messages`. */
  send: (content: string) => Promise<void>;
}

export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestInProgress = useRef(false);

  const send = useCallback(async (content: string) => {
    const question = content.trim();
    if (!question || requestInProgress.current) return;

    // El ref bloquea un doble envío antes del siguiente render de React.
    requestInProgress.current = true;
    setLoading(true);
    setError(null);

    const history: ChatMessage[] = messages.map(({ role, content: messageContent }) => ({
      role,
      content: messageContent,
    }));
    const latestMessage: ChatMessage = { role: "user", content: question };
    const conversation = [
      ...history,
      latestMessage,
    ].slice(-MAX_CONVERSATION_MESSAGES);
    // La vista conserva las fuentes; la solicitud envía únicamente role y content.
    setMessages((current) => [...current, latestMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      });
      const result = (await response.json()) as ApiResponse<ChatResponse>;
      const data = result.data;

      if (!response.ok || !result.success || !data) {
        throw new Error(result.error ?? "No se pudo obtener una respuesta de ANAI.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch (cause) {
      setError(
        cause instanceof Error && cause.name !== "TypeError" && cause.name !== "SyntaxError"
          ? cause.message
          : "No se pudo conectar con ANAI. Revisa tu conexión e intenta de nuevo.",
      );
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }, [messages]);

  return { messages, loading, error, send };
}
