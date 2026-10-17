import type { RetrievedChunk } from "@/server/domain/chunk";
import { assertValidConversation, type ChatMessage } from "@/server/domain/conversation";
import { buildSystemPrompt } from "@/server/domain/services/prompt-builder";
import type { EmbeddingProvider } from "../ports/embedding-provider";
import type { LlmClient } from "../ports/llm-client";
import type { VectorStore } from "../ports/vector-store";

export interface AnswerQuestionOptions {
  topK: number;
  /** Fragmentos con similitud menor a este umbral se descartan. */
  minScore: number;
}

export const DEFAULT_ANSWER_OPTIONS: AnswerQuestionOptions = { topK: 4, minScore: 0.3 };

export const NO_CONTEXT_ANSWER = "No encontré información sobre eso en los documentos disponibles.";

export interface AnswerQuestionResult {
  answer: string;
  sources: RetrievedChunk[];
}

/**
 * Caso de uso RAG de consulta:
 *   pregunta -> embedding -> búsqueda -> prompt con contexto -> LLM -> respuesta + fuentes
 *
 * TODO (Integrantes B + C): explorar
 *  - reformular la pregunta con el historial antes de buscar (preguntas de seguimiento)
 *  - si no hay fuentes, ¿llamar igual al LLM? (hoy se responde sin gastar cuota)
 *  - streaming de la respuesta y caché de embeddings de preguntas repetidas
 */
export class AnswerQuestion {
  constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly store: VectorStore,
    private readonly llm: LlmClient,
    private readonly options: AnswerQuestionOptions = DEFAULT_ANSWER_OPTIONS,
  ) {}

  async execute(messages: ChatMessage[]): Promise<AnswerQuestionResult> {
    assertValidConversation(messages);
    const question = messages[messages.length - 1].content;

    const queryEmbedding = await this.embeddings.embedQuery(question);
    const found = await this.store.searchSimilar(queryEmbedding, this.options.topK);
    const sources = found.filter((s) => s.score >= this.options.minScore);

    if (sources.length === 0) return { answer: NO_CONTEXT_ANSWER, sources: [] };

    const answer = await this.llm.generate({ system: buildSystemPrompt(sources), messages });
    return { answer, sources };
  }
}
