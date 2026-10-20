import type { VectorStore } from "@/server/application/ports/vector-store";
import type { EmbeddedChunk, RetrievedChunk } from "@/server/domain/chunk";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

/** Adaptador en memoria: sirve como referencia de cómo implementar `PgVectorStore` y para pruebas. */
export class InMemoryVectorStore implements VectorStore {
  private readonly chunksBySource = new Map<string, EmbeddedChunk[]>();

  async saveChunks(source: string, chunks: EmbeddedChunk[]): Promise<void> {
    // Reemplaza todo el documento: re-ingestar no duplica ni deja chunks sobrantes.
    this.chunksBySource.set(source, chunks);
  }

  async searchSimilar(queryEmbedding: number[], topK: number): Promise<RetrievedChunk[]> {
    const results: RetrievedChunk[] = [];
    for (const [source, chunks] of this.chunksBySource) {
      for (const chunk of chunks) {
        results.push({
          source,
          chunkIndex: chunk.index,
          content: chunk.content,
          score: cosineSimilarity(queryEmbedding, chunk.embedding),
        });
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}
