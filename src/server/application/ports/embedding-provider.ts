/** Puerto de salida: genera embeddings. Lo implementa la infraestructura (Hugging Face, fake, etc.). */
export interface EmbeddingProvider {
  /** Un vector por texto, en el mismo orden. */
  embedDocuments(texts: string[]): Promise<number[][]>;
  /** Debe usar el MISMO modelo que `embedDocuments`. */
  embedQuery(text: string): Promise<number[]>;
}
