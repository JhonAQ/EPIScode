import type { ChatMessage, ChatResponse } from "@/types";
import { embedQuery } from "./embeddings";
import { getLlm } from "./llm";
import { buildSystemPrompt } from "./prompt";
import { searchSimilar } from "./store";

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
  // La ruta valida que exista un mensaje; el último representa la pregunta actual.
  if (messages.length === 0) {
    throw new Error("Se requiere al menos un mensaje para responder la pregunta.");
  }

  const currentQuestion = messages[messages.length - 1].content;

  // Buscamos contexto usando únicamente la pregunta actual, sin alterar el historial.
  const queryEmbedding = await embedQuery(currentQuestion);
  const sources = await searchSimilar(queryEmbedding);

  // El prompt define qué hacer aunque la búsqueda no encuentre fragmentos.
  const systemPrompt = buildSystemPrompt(sources);

  // El LLM recibe el historial original para conservar el contexto conversacional.
  const llm = getLlm();
  const answer = await llm.generate({
    system: systemPrompt,
    messages,
  });

  return { answer, sources };
}
