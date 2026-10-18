import type { ChatMessage, ChatResponse } from "@/types";
import { embedQuery } from "./embeddings";
import { searchSimilar } from "./store";
import { buildSystemPrompt } from "./prompt";
import { getLlm } from "./llm";

/** Respuesta fija cuando el documento no tiene fragmentos relevantes. */
const NO_CONTEXT_ANSWER =
  "El documento no contiene información suficiente para responder esa pregunta.";

/**
 * Orquesta el flujo RAG de consulta:
 *   pregunta -> embedding -> búsqueda -> (corte) -> prompt -> LLM -> respuesta + fuentes
 */
export async function answerQuestion(messages: ChatMessage[]): Promise<ChatResponse> {
  // La pregunta actual es el último mensaje (route.ts ya validó que es del usuario).
  const question = messages[messages.length - 1].content;

  // Convierte la pregunta en un vector con el MISMO modelo usado en la ingesta.
  const queryEmbedding = await embedQuery(question);

  // Busca los fragmentos más similares (ya aplica umbral y top-k internamente).
  const sources = await searchSimilar(queryEmbedding);

  // ★ Corte sin fuentes: no hay contexto relevante -> NO se llama al LLM
  //   (0 consumo de la cuota). ★
  if (sources.length === 0) {
    return { answer: NO_CONTEXT_ANSWER, sources: [] };
  }

  // Instrucciones + contexto recuperado, y respuesta del proveedor configurado
  // (getLlm aplica el fallback Gemini -> Groq si hiciera falta).
  const system = buildSystemPrompt(sources);
  const answer = await getLlm().generate({ system, messages });

  return { answer, sources };
}
