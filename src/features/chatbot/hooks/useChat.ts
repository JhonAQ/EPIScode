"use client";
import { useRef, useState } from "react";
import { buildChatRequest } from "@/lib/chat-history";
import type { ChatMessage, ChatSource, ApiResponse, ChatResponse } from "@/types";
export interface UiMessage extends ChatMessage { sources?: ChatSource[] }
export interface UseChatResult { messages: UiMessage[]; loading: boolean; error: string | null; send: (content: string) => Promise<void>; retry: () => Promise<void> }
export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const pending = useRef<UiMessage[] | null>(null);
  async function submit(history: UiMessage[]) {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError(null); pending.current = history;
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildChatRequest(history)), signal: AbortSignal.timeout(180000) });
      const result: ApiResponse<ChatResponse> = await response.json();
      if (!response.ok || !result.success || !result.data) throw new Error(result.error ?? "No se pudo obtener respuesta.");
      setMessages([...history, { role: "assistant", content: result.data.answer, sources: result.data.sources }]);
      pending.current = null;
    } catch (e) { setError(e instanceof Error ? e.message : "Error de conexión."); }
    finally { busy.current = false; setLoading(false); }
  }
  async function send(content: string) {
    if (busy.current || !content.trim() || content.length > 1000) return;
    const completed = pending.current ? pending.current.slice(0, -1) : messages;
    const history: UiMessage[] = [...completed, { role: "user", content: content.trim() }];
    setMessages(history);
    await submit(history);
  }
  return { messages, loading, error, send, retry: async () => { if (pending.current) await submit(pending.current); } };
}
