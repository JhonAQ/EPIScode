import type { VectorStore } from "@/server/application/ports/vector-store";
import type { EmbeddedChunk, RetrievedChunk } from "@/server/domain/chunk";
import { getPool, toVectorLiteral } from "./pool";

/** Adaptador de `VectorStore` sobre Postgres + pgvector (tabla `chunks`, ver db/init/01-schema.sql). */
export class PgVectorStore implements VectorStore {
  /**
   * TODO (Integrante B): guardar los fragmentos con su embedding en la tabla `chunks`.
   *
   * Pistas:
   *  - Usa `getPool().query(sql, params)` y `toVectorLiteral(chunk.embedding)` para la columna vector.
   *  - La tabla tiene UNIQUE (source, chunk_index): usa `ON CONFLICT ... DO UPDATE`
   *    para que re-ingestar un documento no falle ni duplique.
   *  - Si el documento ahora tiene menos chunks que antes, ¿qué pasa con los sobrantes?
   *  - Considera hacerlo en una transacción.
   */
  async saveChunks(source: string, chunks: EmbeddedChunk[]): Promise<void> {
    void getPool;
    void toVectorLiteral;
    void source;
    void chunks;
    throw new Error("TODO: implementar PgVectorStore.saveChunks()");
  }

  /**
   * TODO (Integrante C): buscar los `topK` fragmentos más parecidos a la pregunta.
   *
   * Pistas:
   *  - `<=>` es la distancia coseno en pgvector; similitud = 1 - distancia.
   *      SELECT ..., 1 - (embedding <=> $1::vector) AS score
   *      FROM chunks ORDER BY embedding <=> $1::vector LIMIT $2
   *  - El umbral de `score` mínimo lo aplica el caso de uso (AnswerQuestion), no el adaptador.
   */
  async searchSimilar(queryEmbedding: number[], topK: number): Promise<RetrievedChunk[]> {
    void queryEmbedding;
    void topK;
    throw new Error("TODO: implementar PgVectorStore.searchSimilar()");
  }
}
