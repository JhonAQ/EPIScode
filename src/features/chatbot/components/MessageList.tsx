import type { UiMessage } from "../hooks/useChat";
import { MessageBubble } from "./MessageBubble";

export interface MessageListProps {
  messages: UiMessage[];
  loading: boolean;
}

/** Renderiza el historial y anuncia de forma accesible cuándo se espera una respuesta. */
export function MessageList({ messages, loading }: MessageListProps) {
  return (
    <ol aria-label="Conversación" className="flex flex-col gap-4 px-4 py-6">
      {messages.map((message, index) => (
        <MessageBubble key={`${message.role}-${index}`} message={message} />
      ))}
      {loading && (
        <li role="status" aria-live="polite" className="text-sm text-zinc-600 dark:text-zinc-400">
          El asistente está preparando una respuesta…
        </li>
      )}
    </ol>
  );
}
