import { chunkText } from "./chunker";
import { embedTexts } from "./embeddings";
import { saveChunks } from "./store";

/**
 * Ingiere un documento completo: texto -> chunks -> embeddings -> Postgres.
 * Devuelve la cantidad de fragmentos guardados.
 *
 * Es idempotente: reingerir el mismo documento no duplica filas,
 * porque saveChunks hace ON CONFLICT sobre UNIQUE(source, chunk_index).
 */
export async function ingestDocument(source: string, text: string): Promise<number> {
  // 1. Trocea el documento en fragmentos (cálculo en memoria, no necesita await).
  const chunks = chunkText(text);

  // 2. Convierte cada fragmento en un vector de 384 dimensiones.
  //    .map(chunk => chunk.content) extrae solo el texto de cada chunk.
  //    Es async porque llama a Ollama por red.
  const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));

  // 3. Guarda contenido + vector en la tabla `chunks`.
  //    `source` (el nombre del archivo) identifica el documento para citarlo.
  await saveChunks(source, chunks, embeddings);

  // 4. Devuelve cuántos fragmentos se procesaron (lo usa el script para el log).
  return chunks.length;
}
