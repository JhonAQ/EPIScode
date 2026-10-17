/** Fragmento de texto producido al dividir un documento. */
export interface TextChunk {
  index: number;
  content: string;
  metadata?: Record<string, unknown>;
}

/** Fragmento con su vector, listo para guardarse en una base vectorial. */
export interface EmbeddedChunk extends TextChunk {
  embedding: number[];
}

/** Fragmento recuperado por similitud para responder una pregunta. */
export interface RetrievedChunk {
  source: string;
  chunkIndex: number;
  content: string;
  /** Similitud coseno (1 = idéntico). */
  score: number;
}
