"use client";

import { useRef, useState } from "react";
import type { ApiResponse, ChatMessage, ChatResponse, ChatSource } from "@/types";

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

/** Comprueba que el contrato de respuesta contiene las propiedades que usa la interfaz. */
function isChatResponse(value: unknown): value is ApiResponse<ChatResponse> & { success: true; data: ChatResponse } {
  if (typeof value !== "object" || value === null || !("success" in value)) {
    return false;
  }

  if (value.success !== true || !("data" in value) || typeof value.data !== "object" || value.data === null) {
    return false;
  }

  return (
    "answer" in value.data &&
    typeof value.data.answer === "string" &&
    "sources" in value.data &&
    Array.isArray(value.data.sources) &&
    value.data.sources.every(isChatSource)
  );
}

/** Valida cada fuente recibida antes de mostrar sus datos en el chat. */
function isChatSource(value: unknown): value is ChatSource {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "source" in value &&
    typeof value.source === "string" &&
    "chunkIndex" in value &&
    typeof value.chunkIndex === "number" &&
    "content" in value &&
    typeof value.content === "string" &&
    "score" in value &&
    typeof value.score === "number"
  );
}

/** Envía el historial al endpoint y valida el sobre de respuesta antes de devolverlo. */
export async function requestChat(
  messages: UiMessage[],
  fetcher: typeof fetch = fetch,
): Promise<ChatResponse> {
  const requestMessages: ChatMessage[] = messages.map(({ role, content }) => ({ role, content }));
  let response: Response;

  try {
    response = await fetcher("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: requestMessages }),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta no válida. Intentá de nuevo.");
  }

  if (!isChatResponse(body)) {
    if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
      throw new Error(body.error);
    }
    throw new Error("El servidor devolvió una respuesta no válida. Intentá de nuevo.");
  }

  if (!response.ok) {
    throw new Error("No se pudo procesar la consulta. Intentá de nuevo.");
  }

  return body.data;
}

/** Mantiene el historial visible, el estado de la solicitud y el último mensaje reintentable. */
export function useChat(): UseChatResult & { retry: () => Promise<void> } {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestInProgress = useRef(false);

  /** Agrega una pregunta solo una vez y usa el mismo camino para el reintento. */
  async function submitHistory(history: UiMessage[], addUserMessage?: string): Promise<void> {
    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setLoading(true);
    setError(null);

    if (addUserMessage !== undefined) {
      const userMessage: UiMessage = { role: "user", content: addUserMessage };
      history = [...history, userMessage];
      setMessages(history);
    }

    try {
      const answer = await requestChat(history);
      setMessages([...history, { role: "assistant", content: answer.answer, sources: answer.sources }]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ocurrió un error inesperado. Intentá de nuevo.",
      );
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }

  /** Inicia una consulta nueva sin bloquear el render para evitar dobles envíos. */
  async function send(content: string): Promise<void> {
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0 || requestInProgress.current) {
      return;
    }

    await submitHistory(messages, trimmedContent);
  }

  /** Reenvía el historial que quedó pendiente sin agregar otro mensaje del usuario. */
  async function retry(): Promise<void> {
    if (requestInProgress.current || messages.length === 0 || messages.at(-1)?.role !== "user") {
      return;
    }

    await submitHistory(messages);
  }

  return { messages, loading, error, send, retry };
}
