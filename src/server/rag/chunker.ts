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
  // Extraemos las propiedades del chunk
  const { size, overlap } = options;

  // Validadores
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("El tamaño debe ser un entero positivo.");
  }
  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= size) {
    throw new Error("El overlap debe ser un entero no negativo y menor que el tamaño del fragmento.");
  }

  // Lista de los chunks
  const chunks: TextChunk[] = [];

  // Recorre el texto y divide en chunks
  for (let start = 0; start < text.length; start += size - overlap) {
    chunks.push({ index: chunks.length, content: text.slice(start, start + size) });
  }

  // Devuelve la lista con los chunks
  return chunks;
}
