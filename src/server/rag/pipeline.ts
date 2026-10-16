import "server-only";
import type { ChatMessage, ChatResponse } from "@/types";
import { embedQuery } from "./embeddings";
import { searchSimilar } from "./store";
import { buildSystemPrompt } from "./prompt";
import { getLlm } from "./llm";

/** Coordina la consulta RAG; searchSimilar aplica el umbral antes de construir el prompt. */
export async function answerQuestion(messages: ChatMessage[]): Promise<ChatResponse> {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("answerQuestion: se requiere un historial no vacío con una pregunta del usuario.");
  }
  // Copiar antes del primer await: no modificar ni duplicar la pregunta del llamador.
  const history = Array.from(messages, (message) => {
    if (!message || (message.role !== "user" && message.role !== "assistant") ||
        typeof message.content !== "string" || message.content.trim().length === 0) {
      throw new Error("answerQuestion: cada mensaje debe tener un rol válido y texto no vacío.");
    }
    return { role: message.role, content: message.content };
  });
  const current = history[history.length - 1];
  if (current.role !== "user") {
    throw new Error("answerQuestion: el último mensaje debe ser una pregunta del usuario.");
  }

  const embedding = await embedQuery(current.content.trim());
  const sources = await searchSimilar(embedding);
  if (sources.length === 0) {
    return {
      answer: "No dispongo de información suficiente en los fragmentos proporcionados para responder esa pregunta.",
      sources: [],
    };
  }
  const system = buildSystemPrompt(sources);
  const answer = await getLlm().generate({ system, messages: history });
  return { answer, sources };
}
