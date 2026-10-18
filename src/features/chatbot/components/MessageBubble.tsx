import type { UiMessage } from "../hooks/useChat";
import { SourcesList } from "./SourcesList";

export interface MessageBubbleProps {
  message: UiMessage;
}

/** Diferencia visualmente las preguntas y respuestas sin interpretar texto como HTML. */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <li className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <article
        aria-label={isUser ? "Tu mensaje" : "Respuesta del asistente"}
        className={`max-w-[min(90%,48rem)] rounded-xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "bg-blue-700 text-white"
            : "border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {!isUser && message.sources && <SourcesList sources={message.sources} />}
      </article>
    </li>
  );
}
