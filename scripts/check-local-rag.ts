import assert from "node:assert/strict";
import { embedTexts } from "../src/server/rag/embeddings";
import { searchSimilar } from "../src/server/rag/store";
import { getPool } from "../src/server/db";
async function main() {
  const vectors = await embedTexts(["¿Para qué sirve el overlap?", "El overlap conserva el contexto al cortar fragmentos.", "La receta de un pastel de chocolate."]);
  assert.equal(vectors[0].length, 384);
  const dot = (a: number[], b: number[]) => a.reduce((sum, n, i) => sum + n * b[i], 0);
  assert.ok(dot(vectors[0], vectors[1]) > dot(vectors[0], vectors[2]), "La similitud semántica debe favorecer la explicación de overlap");
  const sources = await searchSimilar(vectors[0]);
  assert.ok(sources.length > 0, "Faltan documentos ingeridos");
  assert.ok(sources.some(s => /overlap|solapamiento/i.test(s.content)));
  console.log("OK: embeddings locales de 384 dimensiones y recuperación de fuentes reales.");
  console.log("Fuentes:", sources.map(s => ({ source: s.source, chunk: s.chunkIndex, score: Number(s.score.toFixed(3)) })));
  console.log("Clave LLM configurada:", Boolean(process.env.LLM_PROVIDER === "groq" ? process.env.GROQ_API_KEY : process.env.GEMINI_API_KEY));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Error"); process.exitCode = 1; }).finally(() => getPool().end());
