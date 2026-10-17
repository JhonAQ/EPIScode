import type { ChatMessage, ChatResponse } from "@/types";
import { embedQuery } from "./embeddings";
import { searchSimilar } from "./store";
import { buildSystemPrompt } from "./prompt";
import { getLlm } from "./llm";
export async function answerQuestion(messages: ChatMessage[]): Promise<ChatResponse> {
  const question = messages.at(-1);
  if (!question || question.role !== "user") throw new Error("Falta pregunta");
  const sources = await searchSimilar(await embedQuery(question.content));
  if (!sources.length) return { answer: "El documento no contiene información suficiente para responder esa pregunta.", sources: [] };
  return { answer: await getLlm().generate({ system: buildSystemPrompt(sources), messages }), sources };
}
