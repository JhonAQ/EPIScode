/**
 * TODO (Integrantes A + B, en conjunto): ingesta de un documento.
 *
 *   texto -> chunks -> embeddings -> base vectorial
 *
 * Funciones que debe usar: chunkText (./chunker), embedTexts (./embeddings), saveChunks (./store).
 * Debe devolver la cantidad de fragmentos guardados.
 */
export async function ingestDocument(source: string, text: string): Promise<number> {
  void source;
  void text;
  throw new Error("TODO: implementar ingestDocument() en src/server/rag/ingest.ts");
}
