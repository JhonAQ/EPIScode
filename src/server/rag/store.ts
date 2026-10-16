import { getPool, toVectorLiteral } from "@/server/db";
import type { ChatSource } from "@/types";
import type { TextChunk } from "./chunker";

// Este umbral es un punto de partida basado en una evaluación previa, no una verdad universal calibrada.
const MINIMUM_SIMILARITY = 0.15;

export async function saveChunks(source: string, chunks: TextChunk[], embeddings: number[][]): Promise<void> {
  if (chunks.length !== embeddings.length) {
    throw new Error("Cada fragmento debe tener exactamente un embedding.");
  }

  // Se usa una sola conexión para que el bloqueo, la limpieza y las escrituras pertenezcan a la misma transacción.
  const client = await getPool().connect();

  try {
    // La transacción evita dejar una fuente parcialmente actualizada si falla una operación.
    await client.query("BEGIN");

    // El bloqueo asesor serializa ingestas simultáneas de la misma fuente sin bloquear otras fuentes.
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [source]);

    // Eliminamos los índices que ya no existen; una lista vacía también elimina todos los fragmentos previos.
    const currentIndexes = chunks.map((chunk) => chunk.index);
    await client.query("DELETE FROM chunks WHERE source = $1 AND NOT (chunk_index = ANY($2::int[]))", [
      source,
      currentIndexes,
    ]);

    // Insertamos cada fragmento y actualizamos su contenido si ya existe esa posición.
    for (const [position, chunk] of chunks.entries()) {
      await client.query(
        `INSERT INTO chunks (source, chunk_index, content, metadata, embedding)
         VALUES ($1, $2, $3, $4, $5::vector)
         ON CONFLICT (source, chunk_index) DO UPDATE
         SET content = EXCLUDED.content,
             metadata = EXCLUDED.metadata,
             embedding = EXCLUDED.embedding`,
        [source, chunk.index, chunk.content, chunk.metadata ?? {}, toVectorLiteral(embeddings[position])],
      );
    }

    // Confirmamos solo cuando la limpieza y todas las escrituras terminaron correctamente.
    await client.query("COMMIT");
  } catch (error) {
    // Si una operación falla, revertimos también las escrituras anteriores de esta ingesta.
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      // Conservamos ambos diagnósticos cuando también falla la reversión de la transacción.
      throw new AggregateError([error, rollbackError], "Fallaron la operación de guardado y la reversión.");
    }

    throw error;
  } finally {
    // Liberamos la conexión tanto si la transacción terminó bien como si tuvo un error.
    client.release();
  }
}

export async function searchSimilar(queryEmbedding: number[], topK = 4): Promise<ChatSource[]> {
  if (!Number.isInteger(topK) || topK <= 0) {
    throw new Error("El límite de resultados debe ser un entero positivo.");
  }

  // pgvector recibe el embedding como literal vector y todos los datos permanecen parametrizados.
  const result = await getPool().query(
     `SELECT source, chunk_index, content,
            1 - (embedding <=> $1::vector) AS score
     FROM chunks
     WHERE 1 - (embedding <=> $1::vector) >= $3
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [toVectorLiteral(queryEmbedding), topK, MINIMUM_SIMILARITY],
  );

  // Adaptamos el nombre de columna SQL al tipo público de fuentes del chat.
  return result.rows.map((row) => ({
    source: row.source,
    chunkIndex: row.chunk_index,
    content: row.content,
    score: Number(row.score),
  }));
}
