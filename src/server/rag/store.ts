import { getPool, toVectorLiteral } from "@/server/db";
import { config } from "@/server/config";
import type { ChatSource } from "@/types";
import type { TextChunk } from "./chunker";

/** Reemplaza atómicamente los fragmentos de un documento, conservando los IDs existentes. */
export async function saveChunks(source: string, chunks: TextChunk[], embeddings: number[][]): Promise<void> {
  if (typeof source !== "string" || source.trim().length === 0) {
    throw new Error("saveChunks: source debe ser un texto no vacío.");
  }
  if (!Array.isArray(chunks) || !Array.isArray(embeddings) || chunks.length !== embeddings.length) {
    throw new Error("saveChunks: debe haber exactamente un embedding por fragmento.");
  }
  const indices = new Set<number>();
  // Preparar y validar todo antes de abrir la transacción o modificar datos.
  const rows = Array.from(chunks, (chunk, position) => {
    if (!chunk || !Number.isInteger(chunk.index) || chunk.index < 0 || chunk.index > 2_147_483_647 || indices.has(chunk.index)) {
      throw new Error("saveChunks: los índices deben ser enteros no negativos, únicos y válidos para INTEGER.");
    }
    indices.add(chunk.index);
    if (typeof chunk.content !== "string") {
      throw new Error(`saveChunks: contenido inválido en el fragmento ${position}.`);
    }
    const vector = embeddings[position];
    if (!Array.isArray(vector) || vector.length !== config.embeddings.dimensions ||
        Array.from(vector).some((value) => typeof value !== "number" || !Number.isFinite(value))) {
      throw new Error(`saveChunks: el vector ${position} debe contener 384 números finitos.`);
    }
    const metadata = chunk.metadata ?? {};
    if (typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new Error(`saveChunks: metadata debe ser un objeto en el fragmento ${position}.`);
    }
    return [source, chunk.index, chunk.content, JSON.stringify(metadata), toVectorLiteral(vector)];
  });

  const client = await getPool().connect();
  let discardClient = false;
  try {
    await client.query("BEGIN");
    // Serializar ingestas concurrentes de la misma fuente, incluso si aún no tiene filas.
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [source]);
    for (const row of rows) {
      await client.query(
        `INSERT INTO chunks (source, chunk_index, content, metadata, embedding)
         VALUES ($1, $2, $3, $4::jsonb, $5::vector)
         ON CONFLICT (source, chunk_index) DO UPDATE
         SET content = EXCLUDED.content,
             metadata = EXCLUDED.metadata,
             embedding = EXCLUDED.embedding`,
        row,
      );
    }
    // Eliminar índices ausentes; [] elimina todos los fragmentos de esa fuente.
    await client.query(
      "DELETE FROM chunks WHERE source = $1 AND NOT (chunk_index = ANY($2::integer[]))",
      [source, [...indices]],
    );
    await client.query("COMMIT");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      discardClient = true;
    }
    throw new Error("saveChunks: no se pudo guardar el documento; se revirtió la transacción.", { cause: error });
  } finally {
    client.release(discardClient);
  }
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
