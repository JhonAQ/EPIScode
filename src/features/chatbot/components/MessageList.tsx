"use client";
import { useEffect, useRef } from "react";
import type { UiMessage } from "../hooks/useChat";
import { MessageBubble } from "./MessageBubble";
export interface MessageListProps { messages: UiMessage[]; loading: boolean }
export function MessageList({ messages, loading }: MessageListProps) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, loading]);
  return <div role="log" aria-live="polite" className="max-h-[60vh] min-h-64 space-y-4 overflow-y-auto p-4">
    {messages.map((message, i) => <MessageBubble key={i} message={message} />)}
    {loading && <p role="status" className="text-sm text-zinc-500">Buscando en el documento y preparando la respuesta...</p>}
    <div ref={end} />
  </div>;
}
