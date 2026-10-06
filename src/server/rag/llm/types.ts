import type { ChatMessage } from "@/types";

export interface LlmRequest {
  /** Instrucciones del sistema (rol, reglas, contexto recuperado). */
  system: string;
  /** Historial de la conversación (el último mensaje es la pregunta actual). */
  messages: ChatMessage[];
}

export interface LlmClient {
  /** Respuesta completa (sin streaming). Implementar streaming es parte del reto. */
  generate(request: LlmRequest): Promise<string>;
}
