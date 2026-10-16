import { chunkText } from "./chunker";

/** Divide un documento, genera sus embeddings y guarda los fragmentos. */
export async function ingestDocument(source: string, text: string): Promise<number> {
  const chunks = chunkText(text);
  if (chunks.length === 0) {
    const { saveChunks } = await import("./store");
    await saveChunks(source, [], []);
    return 0;
  }

  const { embedTexts } = await import("./embeddings");
  const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));
  if (embeddings.length !== chunks.length) {
    throw new Error("Debe haber un embedding por fragmento antes de guardar");
  }

  const { saveChunks } = await import("./store");
  await saveChunks(source, chunks, embeddings);
  return chunks.length;
}
