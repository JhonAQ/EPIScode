import { AnswerQuestion } from "@/server/application/use-cases/answer-question";
import { IngestDocument } from "@/server/application/use-cases/ingest-document";
import { HuggingFaceEmbeddingProvider } from "@/server/infrastructure/embeddings/huggingface-embedding-provider";
import { createLlmClient } from "@/server/infrastructure/llm/create-llm-client";
import { PgVectorStore } from "@/server/infrastructure/persistence/postgres/pg-vector-store";

/**
 * Composition root: el ÚNICO lugar que conoce las implementaciones concretas.
 * Para cambiar un proveedor (otra base vectorial, otro LLM) se cambia aquí; el resto no se entera.
 */
const embeddings = new HuggingFaceEmbeddingProvider();
const store = new PgVectorStore();

let answerQuestion: AnswerQuestion | undefined;
let ingestDocument: IngestDocument | undefined;

// Se crean bajo demanda: así faltar una API key no rompe el arranque de toda la app.
export function getAnswerQuestion(): AnswerQuestion {
  answerQuestion ??= new AnswerQuestion(embeddings, store, createLlmClient());
  return answerQuestion;
}

export function getIngestDocument(): IngestDocument {
  ingestDocument ??= new IngestDocument(embeddings, store);
  return ingestDocument;
}
