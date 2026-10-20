import { chunkText, DEFAULT_CHUNK_OPTIONS, type ChunkOptions } from "@/server/domain/services/chunker";
import type { EmbeddingProvider } from "../ports/embedding-provider";
import type { VectorStore } from "../ports/vector-store";

export interface IngestDocumentInput {
  source: string;
  text: string;
}

/** Caso de uso: texto -> chunks -> embeddings -> base vectorial. Devuelve cuántos fragmentos guardó. */
export class IngestDocument {
  constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly store: VectorStore,
    private readonly chunkOptions: ChunkOptions = DEFAULT_CHUNK_OPTIONS,
  ) {}

  async execute({ source, text }: IngestDocumentInput): Promise<number> {
    const chunks = chunkText(text, this.chunkOptions);
    if (chunks.length === 0) return 0;

    const vectors = await this.embeddings.embedDocuments(chunks.map((c) => c.content));
    if (vectors.length !== chunks.length) {
      throw new Error(`Se esperaban ${chunks.length} embeddings y llegaron ${vectors.length}.`);
    }

    await this.store.saveChunks(
      source,
      chunks.map((chunk, i) => ({ ...chunk, embedding: vectors[i] })),
    );
    return chunks.length;
  }
}
