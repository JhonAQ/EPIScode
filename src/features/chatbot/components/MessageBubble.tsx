import type { UiMessage } from "../hooks/useChat";

export interface MessageBubbleProps {
  message: UiMessage;
}

/**
 * TODO (Integrante D): burbuja de un mensaje. Usuario a la derecha, asistente a la izquierda.
 * Si el asistente trae `message.sources`, mostrar <SourcesList />.
 * Reto: renderizar Markdown de forma segura (sin dangerouslySetInnerHTML con contenido del LLM).
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  void message;
  throw new Error("TODO: implementar MessageBubble");
}
