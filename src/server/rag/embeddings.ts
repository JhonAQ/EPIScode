/**
 * TODO (Integrante B): generar embeddings con la Inference API de Hugging Face (gratis con token "Read").
 *
 * Pistas:
 *  - Variables disponibles en `config.hf` (src/server/config.ts): token, model, dimensions.
 *  - Endpoint (verifíquenlo en la doc de "Inference Providers" -> feature extraction, puede cambiar):
 *      POST https://router.huggingface.co/hf-inference/models/{modelo}/pipeline/feature-extraction
 *      Header: Authorization: Bearer <HF_API_TOKEN>
 *      Body:   { "inputs": ["texto 1", "texto 2"] }
 *      Respuesta: number[][] (un vector por texto)
 *  - Validar que la dimensión devuelta coincida con `config.hf.dimensions` y con vector(N) del SQL.
 *
 * Para explorar:
 *  - procesar en lotes (batches) cuando hay muchos chunks
 *  - reintentos cuando el modelo está "cargando" (503) o hay rate limit (429)
 *  - normalizar el vector (L2) si el modelo no lo hace
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  void texts;
  throw new Error("TODO: implementar embedTexts() en src/server/rag/embeddings.ts");
}

/** Embedding de una sola pregunta del usuario. Debe usar el MISMO modelo que la ingesta. */
export async function embedQuery(text: string): Promise<number[]> {
  void text;
  throw new Error("TODO: implementar embedQuery() en src/server/rag/embeddings.ts");
}
