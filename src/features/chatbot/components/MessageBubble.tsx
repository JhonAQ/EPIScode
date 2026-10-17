import type { UiMessage } from "../hooks/useChat";
import { SourcesList } from "./SourcesList";
export interface MessageBubbleProps { message: UiMessage }
export function MessageBubble({ message }: MessageBubbleProps) {
  return <article className={"max-w-[90%] rounded-xl border p-4 " + (message.role === "user" ? "ml-auto border-indigo-500 bg-indigo-600 text-white" : "mr-auto border-zinc-300")}>
    <p className="mb-2 text-xs font-semibold">{message.role === "user" ? "Tú" : "Asistente"}</p>
    <p className="whitespace-pre-wrap break-words">{message.content}</p>
    {message.role === "assistant" && <SourcesList sources={message.sources ?? []} />}
  </article>;
}
