import type { EmbeddedChunk, RetrievedChunk } from "@/server/domain/chunk";

/** Puerto de salida: almacenamiento y búsqueda vectorial (pgvector, en memoria, etc.). */
export interface VectorStore {
  /** Idempotente: re-ingestar el mismo `source` reemplaza sus fragmentos, no los duplica. */
  saveChunks(source: string, chunks: EmbeddedChunk[]): Promise<void>;
  /** Los `topK` fragmentos más parecidos, de mayor a menor `score`. */
  searchSimilar(queryEmbedding: number[], topK: number): Promise<RetrievedChunk[]>;
}
