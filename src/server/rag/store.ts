import { getPool, toVectorLiteral } from "@/server/db";
import type { ChatSource } from "@/types";
import type { TextChunk } from "./chunker";

const SIMILARITY_THRESHOLD = 0.7;

export async function saveChunks(
  source: string,
  chunks: TextChunk[],
  embeddings: number[][]
): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      const vectorLiteral = toVectorLiteral(embedding);

      await client.query(
        `INSERT INTO chunks (source, chunk_index, content, metadata, embedding)
         VALUES ($1, $2, $3, $4, $5::vector)
         ON CONFLICT (source, chunk_index) DO UPDATE SET
           content = EXCLUDED.content,
           metadata = EXCLUDED.metadata,
           embedding = EXCLUDED.embedding`,
        [
          source,
          chunk.index,
          chunk.content,
          JSON.stringify(chunk.metadata || {}),
          vectorLiteral,
        ]
      );
    }

    // Limpiar chunks huérfanos si el documento ahora tiene menos chunks
    await client.query(
      `DELETE FROM chunks WHERE source = $1 AND chunk_index >= $2`,
      [source, chunks.length]
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function searchSimilar(
  queryEmbedding: number[],
  topK = 4
): Promise<ChatSource[]> {
  const pool = getPool();
  const vectorLiteral = toVectorLiteral(queryEmbedding);

  const result = await pool.query(
    `SELECT source, chunk_index, content, metadata,
            1 - (embedding <=> $1::vector) AS score
     FROM chunks
     WHERE 1 - (embedding <=> $1::vector) > $2
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    [vectorLiteral, SIMILARITY_THRESHOLD, topK]
  );

  return result.rows.map((row) => ({
    source: row.source,
    chunkIndex: row.chunk_index,
    content: row.content,
    score: parseFloat(row.score.toFixed(4)),
  }));
}