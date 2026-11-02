import { useEffect, useRef } from "react";
import type { UiMessage } from "../hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

export interface MessageListProps {
  messages: UiMessage[];
  loading: boolean;
  error: string | null;
}

/** Mantiene las respuestas recientes a la vista dentro del área de mensajes. */
export function MessageList({ messages, loading, error }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = endRef.current?.parentElement?.parentElement;
    container?.scrollTo({
      top: container.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [messages, loading, error]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8" aria-live="polite" aria-relevant="additions text">
      <div className="flex min-h-full flex-col justify-end gap-4">
        {messages.length === 0 ? (
          <div className="flex justify-start">
            <p className="max-w-[88%] rounded-3xl rounded-bl-lg bg-surface-subtle px-5 py-3 text-[15px] leading-6 text-text-main shadow-card-soft">
              ¡Hola! ¿En qué puedo ayudarte hoy?
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={`${message.role}-${index}`} message={message} />
          ))
        )}
        {loading && <TypingIndicator />}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
