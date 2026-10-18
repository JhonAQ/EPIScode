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

/**
 * Error de un proveedor LLM. Lleva el código HTTP (`status`) para que
 * getLlm() pueda decidir si conviene el fallback (p. ej. 429 = sin cuota).
 */
export class LlmError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "LlmError";
  }
}
