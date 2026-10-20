import type { UiMessage } from "../hooks/useChat";

export interface MessageListProps {
  messages: UiMessage[];
  loading: boolean;
}

/** TODO (Integrante D): renderizar los mensajes, el indicador de carga y hacer scroll al último. */
export function MessageList({ messages, loading }: MessageListProps) {
  void messages;
  void loading;
  throw new Error("TODO: implementar MessageList");
}
