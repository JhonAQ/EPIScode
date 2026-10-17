import { chunkText } from "./chunker";
import { embedTexts } from "./embeddings";
import { saveChunks } from "./store";

/** Procesa un documento y devuelve la cantidad de fragmentos guardados. */
export async function ingestDocument(source: string, text: string): Promise<number> {
  // Primero dividimos el texto para que cada fragmento pueda indexarse por separado.
  const chunks = chunkText(text);

  // Generamos un embedding por fragmento, conservando el mismo orden.
  const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));

  // Guardamos juntos el contenido y sus vectores bajo el origen del documento.
  await saveChunks(source, chunks, embeddings);

  // La cantidad guardada corresponde a la cantidad de fragmentos procesados.
  return chunks.length;
}
