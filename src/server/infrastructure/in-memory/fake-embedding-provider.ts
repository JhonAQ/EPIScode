import type { EmbeddingProvider } from "@/server/application/ports/embedding-provider";

/**
 * Embeddings falsos y deterministas (bolsa de palabras con hashing). NO son semánticos:
 * solo textos con palabras en común se parecen. Útil para probar el flujo sin red ni API keys.
 */
export class FakeEmbeddingProvider implements EmbeddingProvider {
  constructor(private readonly dimensions = 64) {}

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return texts.map((text) => this.embed(text));
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.embed(text);
  }

  private embed(text: string): number[] {
    const vector = new Array<number>(this.dimensions).fill(0);
    for (const word of text.toLowerCase().match(/\p{L}+/gu) ?? []) {
      let hash = 0;
      for (const char of word) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
      vector[hash % this.dimensions] += 1;
    }
    return vector;
  }
}
