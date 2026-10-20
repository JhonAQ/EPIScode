import { InvalidConversationError } from "./errors";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Límites que acotan el gasto de la cuota gratuita de los proveedores. */
export const CONVERSATION_LIMITS = {
  maxMessages: 20,
  maxMessageLength: 2000,
} as const;

/**
 * Regla de negocio: una conversación válida no está vacía, respeta los límites
 * y termina con una pregunta del usuario. Lanza `InvalidConversationError`.
 */
export function assertValidConversation(messages: readonly ChatMessage[]): void {
  if (messages.length === 0) {
    throw new InvalidConversationError("La conversación no puede estar vacía.");
  }
  if (messages.length > CONVERSATION_LIMITS.maxMessages) {
    throw new InvalidConversationError(`Máximo ${CONVERSATION_LIMITS.maxMessages} mensajes por conversación.`);
  }
  for (const message of messages) {
    if (message.content.trim().length === 0) {
      throw new InvalidConversationError("Los mensajes no pueden estar vacíos.");
    }
    if (message.content.length > CONVERSATION_LIMITS.maxMessageLength) {
      throw new InvalidConversationError(
        `Cada mensaje admite máximo ${CONVERSATION_LIMITS.maxMessageLength} caracteres.`,
      );
    }
  }
  if (messages[messages.length - 1].role !== "user") {
    throw new InvalidConversationError("El último mensaje debe ser del usuario.");
  }
}
