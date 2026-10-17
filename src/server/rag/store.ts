import { getPool, toVectorLiteral } from "@/server/db";
import type { ChatSource } from "@/types";
import type { TextChunk } from "./chunker";
import { validateEmbedding } from "./embeddings";
export async function saveChunks(source: string, chunks: TextChunk[], embeddings: number[][]): Promise<void> {
  await persistDocuments([{ source, chunks, embeddings }], false);
}

export interface PreparedDocument {
  source: string;
  chunks: TextChunk[];
  embeddings: number[][];
}

export async function saveCorpus(documents: PreparedDocument[]): Promise<void> {
  await persistDocuments(documents, true);
}

async function persistDocuments(documents: PreparedDocument[], replaceCorpus: boolean): Promise<void> {
  if (new Set(documents.map(document => document.source)).size !== documents.length) throw new Error("Documentos duplicados");
  for (const document of documents) {
    if (document.chunks.length !== document.embeddings.length) throw new Error("Cantidad de embeddings incorrecta");
    document.embeddings.forEach(validateEmbedding);
  }
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["rag-corpus"]);
    if (replaceCorpus) await client.query("DELETE FROM chunks WHERE NOT (source = ANY($1::text[]))", [documents.map(document => document.source)]);
    for (const { source, chunks, embeddings } of documents) {
      await client.query("DELETE FROM chunks WHERE source = $1", [source]);
      for (let index = 0; index < chunks.length; index++) await client.query("INSERT INTO chunks (source, chunk_index, content, metadata, embedding) VALUES ($1,$2,$3,$4,$5::vector)", [source, chunks[index].index, chunks[index].content, JSON.stringify(chunks[index].metadata ?? {}), toVectorLiteral(embeddings[index])]);
    }
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
export async function searchSimilar(queryEmbedding: number[], topK = 5): Promise<ChatSource[]> {
  validateEmbedding(queryEmbedding);
  if (!Number.isInteger(topK) || topK < 1 || topK > 20) throw new Error("topK inválido");
  const threshold = Number(process.env.RAG_MIN_SCORE ?? 0.25);
  if (!Number.isFinite(threshold) || threshold < -1 || threshold > 1) throw new Error("Umbral inválido");
  const { rows } = await getPool().query<ChatSource>('SELECT source, chunk_index AS "chunkIndex", content, 1 - (embedding <=> $1::vector) AS score FROM chunks ORDER BY embedding <=> $1::vector LIMIT $2', [toVectorLiteral(queryEmbedding), topK]);
  return rows.filter(row => row.score >= threshold);
}
