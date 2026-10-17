export interface TextChunk { index: number; content: string; metadata?: Record<string, unknown> }
export interface ChunkOptions { size: number; overlap: number }
export const DEFAULT_CHUNK_OPTIONS = { size: 800, overlap: 100 };
export function chunkText(text: string, { size, overlap }: ChunkOptions = DEFAULT_CHUNK_OPTIONS): TextChunk[] {
  if (!Number.isInteger(size) || !Number.isInteger(overlap) || size <= 0 || overlap < 0 || overlap >= size) throw new Error("Opciones de chunking inválidas");
  const input = text.replace(/\r\n?/g, "\n").trim();
  const chunks: TextChunk[] = [];
  for (let start = 0; start < input.length;) {
    let end = Math.min(start + size, input.length);
    const boundary = input.lastIndexOf("\n\n", end);
    if (end < input.length && boundary > start + Math.max(overlap, size / 2)) end = boundary;
    const content = input.slice(start, end).trim();
    if (content) chunks.push({ index: chunks.length, content, metadata: { start, end } });
    if (end === input.length) break;
    start = end - overlap;
  }
  return chunks;
}
