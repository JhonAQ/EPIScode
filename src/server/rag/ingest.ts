import { chunkText } from "./chunker";
import { embedTexts } from "./embeddings";
import { saveChunks, saveCorpus, type PreparedDocument } from "./store";
export async function ingestDocument(source: string, text: string): Promise<number> {
  const chunks = chunkText(text);
  if (!chunks.length) throw new Error("Documento vacío: " + source);
  await saveChunks(source, chunks, await embedTexts(chunks.map(chunk => chunk.content)));
  return chunks.length;
}

export async function ingestDocuments(documents: { source: string; text: string }[]): Promise<{ source: string; count: number }[]> {
  const prepared: PreparedDocument[] = [];
  for (const { source, text } of documents) {
    const chunks = chunkText(text);
    if (!chunks.length) throw new Error("Documento vacío: " + source);
    prepared.push({ source, chunks, embeddings: await embedTexts(chunks.map(chunk => chunk.content)) });
  }
  await saveCorpus(prepared);
  return prepared.map(({ source, chunks }) => ({ source, count: chunks.length }));
}
