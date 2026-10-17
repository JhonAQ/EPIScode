"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import type { UiMessage } from "../hooks/useChat";

export interface MessageListProps {
  messages: UiMessage[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [messages, loading]);
  return (
    <div ref={list} role="log" aria-label="Historial de conversación" aria-live="polite" aria-relevant="additions" tabIndex={0}
      className="min-h-64 max-h-[55dvh] overflow-y-auto p-4 focus-visible:outline-2 focus-visible:outline-inset sm:p-6">
      {messages.length === 0 && <div className="py-10 text-center"><p className="font-medium">Empieza con una pregunta</p><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Por ejemplo: ¿Qué significa RAG? o ¿Para qué sirve el overlap?</p></div>}
      <div className="space-y-5">{messages.map((message, index) => <MessageBubble key={index} message={message} />)}</div>
      {loading && <p role="status" className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">Consultando los documentos…</p>}
    </div>
  );
}
