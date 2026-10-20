import type { TextChunk } from "../chunk";

export interface ChunkOptions {
  /** Tamaño objetivo de cada fragmento, en caracteres. */
  size: number;
  /** Caracteres compartidos entre fragmentos consecutivos. */
  overlap: number;
}

export const DEFAULT_CHUNK_OPTIONS: ChunkOptions = { size: 800, overlap: 100 };

/**
 * Divide `text` en fragmentos. Lógica pura: sin I/O, fácil de probar.
 *
 * Implementación actual (nivel 1): ventana deslizante por caracteres.
 *
 * TODO (Integrante A): mejorarla.
 *  - Nivel 2: separar por párrafos y unirlos hasta llegar a `size` (no cortar oraciones a la mitad).
 *  - Nivel 3: guardar en `metadata` el título de la sección Markdown a la que pertenece.
 *  - ¿Cómo cambia la calidad de las respuestas con size=300 vs size=1500? Mídelo.
 */
export function chunkText(text: string, options: ChunkOptions = DEFAULT_CHUNK_OPTIONS): TextChunk[] {
  const { size, overlap } = options;
  if (size <= 0) throw new RangeError("size debe ser mayor que 0");
  if (overlap < 0 || overlap >= size) throw new RangeError("overlap debe estar entre 0 y size - 1");

  const chunks: TextChunk[] = [];
  const step = size - overlap;

  for (let start = 0; start < text.length; start += step) {
    const content = text.slice(start, start + size).trim();
    if (content) chunks.push({ index: chunks.length, content });
    if (start + size >= text.length) break;
  }
  return chunks;
}
