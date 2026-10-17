import type { ChatMessage } from "@/server/domain/conversation";
import { InvalidConversationError } from "@/server/domain/errors";

/**
 * Valida la FORMA del JSON que llega por HTTP (adaptador de entrada).
 * Las reglas de negocio (límites, último mensaje del usuario) viven en el dominio.
 */
export function parseChatRequest(body: unknown): ChatMessage[] {
  if (typeof body !== "object" || body === null || !Array.isArray((body as { messages?: unknown }).messages)) {
    throw new InvalidConversationError("Se esperaba { messages: [...] }.");
  }
  return (body as { messages: unknown[] }).messages.map((raw) => {
    const m = raw as Partial<ChatMessage> | null;
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      throw new InvalidConversationError("Cada mensaje necesita role ('user' | 'assistant') y content (texto).");
    }
    return { role: m.role, content: m.content };
  });
}
