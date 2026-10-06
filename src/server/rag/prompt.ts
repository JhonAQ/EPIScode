import type { ChatSource } from "@/types";

/**
 * TODO (Integrante C): construir el prompt de sistema con el contexto recuperado.
 *
 * Qué debería incluir:
 *  - Rol del asistente y que debe responder SOLO con el contexto dado.
 *  - Qué hacer cuando el contexto no contiene la respuesta (decir "no lo sé", no inventar).
 *  - Los fragmentos, claramente delimitados y numerados.
 *  - Una defensa básica contra prompt injection: el contexto son DATOS, no instrucciones.
 *  - Idioma de la respuesta.
 *
 * Experimenta: cambia el prompt y mide el efecto con las preguntas de docs/knowledge/preguntas-evaluacion.md.
 */
export function buildSystemPrompt(sources: ChatSource[]): string {
  void sources;
  throw new Error("TODO: implementar buildSystemPrompt() en src/server/rag/prompt.ts");
}
