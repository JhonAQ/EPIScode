export interface TextChunk {
  index: number;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChunkOptions {
  /** Tamaño objetivo de cada fragmento, en caracteres. */
  size: number;
  /** Caracteres compartidos entre fragmentos consecutivos. */
  overlap: number;
}

export const DEFAULT_CHUNK_OPTIONS: ChunkOptions = { size: 800, overlap: 100 };

/**
 * TODO (Integrante A): dividir `text` en fragmentos.
 *
 * Preguntas para explorar:
 *  - ¿Qué pasa si cortas en mitad de una oración? ¿Y si respetas párrafos / títulos Markdown?
 *  - ¿Cómo cambia la calidad de las respuestas con size=300 vs size=1500?
 *  - ¿Para qué sirve el overlap?
 *
 * Nivel 1: ventana deslizante por caracteres.
 * Nivel 2: separar por párrafos y unirlos hasta llegar a `size`.
 * Nivel 3: guardar en `metadata` el título de la sección a la que pertenece.
 */
export function chunkText(text: string, options: ChunkOptions = DEFAULT_CHUNK_OPTIONS): TextChunk[] {
  void text;
  void options;
  throw new Error("TODO: implementar chunkText() en src/server/rag/chunker.ts");
}
