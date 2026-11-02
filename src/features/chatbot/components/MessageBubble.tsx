import type { UiMessage } from "../hooks/useChat";
import { SourcesList } from "./SourcesList";

export interface MessageBubbleProps {
  message: UiMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-3xl px-5 py-3 text-[15px] leading-6 shadow-card-soft ${
          isUser ? "rounded-br-lg bg-epis-maroon text-white" : "rounded-bl-lg bg-surface-subtle text-text-main"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {!isUser && message.sources && message.sources.length > 0 && <SourcesList sources={message.sources} />}
      </div>
    </div>
  );
}
