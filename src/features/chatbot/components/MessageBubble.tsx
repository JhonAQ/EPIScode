import type { UiMessage } from "../hooks/useChat";
import { SourcesList } from "./SourcesList";

export interface MessageBubbleProps {
  message: UiMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const user = message.role === "user";
  const citations = [...new Set([...message.content.matchAll(/\[([^\]\n]+)\]/g)].map((match) => match[1]))];
  return (
    <article aria-label={user ? "Mensaje del usuario" : "Respuesta del asistente"} className={user ? "ml-auto max-w-[95%] sm:max-w-[85%]" : "mr-auto w-full min-w-0"}>
      <p className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400">{user ? "Tú" : "Asistente"}</p>
      <p className={`whitespace-pre-wrap break-words rounded-xl p-4 text-sm leading-6 [overflow-wrap:anywhere] ${user ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-900"}`}>{message.content}</p>
      {!user && <SourcesList sources={message.sources ?? []} citations={citations} />}
    </article>
  );
}
