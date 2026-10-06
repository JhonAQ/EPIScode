"use client";

import type { ChatMessage, ChatSource } from "@/types";

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

/**
 * TODO (Integrante D): implementar el estado y la comunicación con el backend.
 *
 * Contrato del endpoint (ya existe en src/app/api/chat/route.ts):
 *   POST /api/chat
 *   body:      { messages: { role: "user" | "assistant", content: string }[] }
 *   respuesta: { success: boolean, data?: { answer: string, sources: ChatSource[] }, error?: string }
 *
 * Qué debe hacer:
 *  - Agregar el mensaje del usuario al historial de inmediato (UI optimista).
 *  - Enviar el historial completo (solo `role` y `content`, sin `sources`).
 *  - Manejar `loading` y `error` (red caída, 400, 500).
 *  - Evitar envíos duplicados mientras `loading` es true.
 *
 * Reto: cuando el backend soporte streaming, ir actualizando el último mensaje token a token.
 */
export function useChat(): UseChatResult {
  throw new Error("TODO: implementar useChat() en src/features/chatbot/hooks/useChat.ts");
}
