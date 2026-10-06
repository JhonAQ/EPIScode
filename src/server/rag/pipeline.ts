import type { ChatMessage, ChatResponse } from "@/types";

/**
 * TODO (Integrantes B + C, en conjunto): orquestar el flujo RAG de consulta.
 *
 *   pregunta -> embedding -> búsqueda -> prompt con contexto -> LLM -> respuesta + fuentes
 *
 * Funciones que debe usar: embedQuery (./embeddings), searchSimilar (./store),
 * buildSystemPrompt (./prompt) y getLlm (./llm).
 * La pregunta actual es el último mensaje de `messages` (validado en route.ts).
 *
 * Para explorar:
 *  - usar el historial para reformular la pregunta antes de buscar (preguntas de seguimiento)
 *  - qué hacer si `searchSimilar` no devuelve nada (¿llamar igual al LLM?)
 *  - streaming de la respuesta
 *  - cachear embeddings de preguntas repetidas
 */
export async function answerQuestion(messages: ChatMessage[]): Promise<ChatResponse> {
  void messages;
  throw new Error("TODO: implementar answerQuestion() en src/server/rag/pipeline.ts");
}
