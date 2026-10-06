import { getPool, toVectorLiteral } from "@/server/db";
import type { ChatSource } from "@/types";
import type { TextChunk } from "./chunker";

/**
 * TODO (Integrante B): guardar los fragmentos con su embedding en la tabla `chunks`.
 *
 * Pistas:
 *  - Usa `getPool().query(sql, params)` y `toVectorLiteral(embedding)` para la columna vector.
 *  - La tabla tiene UNIQUE (source, chunk_index): usa `ON CONFLICT ... DO UPDATE`
 *    para que re-ingestar un documento no falle ni duplique.
 *  - Si el documento ahora tiene menos chunks que antes, ¿qué pasa con los sobrantes?
 */
export async function saveChunks(source: string, chunks: TextChunk[], embeddings: number[][]): Promise<void> {
  void getPool;
  void toVectorLiteral;
  void source;
  void chunks;
  void embeddings;
  throw new Error("TODO: implementar saveChunks() en src/server/rag/store.ts");
}

/**
 * TODO (Integrante C): buscar los `topK` fragmentos más parecidos a la pregunta.
 *
 * Pistas:
 *  - `<=>` es la distancia coseno en pgvector; similitud = 1 - distancia.
 *      SELECT ..., 1 - (embedding <=> $1::vector) AS score
 *      FROM chunks ORDER BY embedding <=> $1::vector LIMIT $2
 *  - Descarta resultados con `score` bajo (umbral). ¿Qué valor funciona mejor? Pruébalo.
 */
export async function searchSimilar(queryEmbedding: number[], topK = 4): Promise<ChatSource[]> {
  void getPool;
  void toVectorLiteral;
  void queryEmbedding;
  void topK;
  throw new Error("TODO: implementar searchSimilar() en src/server/rag/store.ts");
}
