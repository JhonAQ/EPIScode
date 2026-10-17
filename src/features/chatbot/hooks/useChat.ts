"use client";

import { useState, useSyncExternalStore } from "react";
import { createChatSession } from "../chat-session";
import type { UiMessage } from "../chat-session";
export type { UiMessage } from "../chat-session";

export interface UseChatResult {
  messages: UiMessage[];
  loading: boolean;
  error: string | null;
  /** Envía una pregunta del usuario y agrega la respuesta a `messages`. */
  send: (content: string) => Promise<void>;
  reset: () => void;
}

/** Conecta la sesión de esta ventana con React; solo usa el endpoint HTTP público. */
export function useChat(): UseChatResult {
  const [session] = useState(() => createChatSession());
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getServerSnapshot);
  return { ...state, send: session.send, reset: session.reset };
}
