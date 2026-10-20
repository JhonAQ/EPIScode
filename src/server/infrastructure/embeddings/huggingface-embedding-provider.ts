import type { EmbeddingProvider } from "@/server/application/ports/embedding-provider";
import { config } from "../config/env";

/**
 * Adaptador de `EmbeddingProvider` sobre la Inference API de Hugging Face (gratis con token "Read").
 *
 * TODO (Integrante B): implementar `embedDocuments` (y `embedQuery` puede reutilizarlo).
 *
 * Pistas:
 *  - Variables disponibles en `config.hf` (infrastructure/config/env.ts): token, model, dimensions.
 *  - Endpoint (verifíquenlo en la doc de "Inference Providers" -> feature extraction, puede cambiar):
 *      POST https://router.huggingface.co/hf-inference/models/{modelo}/pipeline/feature-extraction
 *      Header: Authorization: Bearer <HF_API_TOKEN>
 *      Body:   { "inputs": ["texto 1", "texto 2"] }
 *      Respuesta: number[][] (un vector por texto)
 *  - Validar que la dimensión devuelta coincida con `config.hf.dimensions` y con vector(N) del SQL.
 *
 * Para explorar: lotes (batches), reintentos ante 503 (modelo cargando) / 429 (rate limit),
 * normalización L2 si el modelo no la hace.
 */
export class HuggingFaceEmbeddingProvider implements EmbeddingProvider {
  async embedDocuments(texts: string[]): Promise<number[][]> {
    void config;
    void texts;
    throw new Error("TODO: implementar HuggingFaceEmbeddingProvider.embedDocuments()");
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embedDocuments([text]);
    return vector;
  }
}
