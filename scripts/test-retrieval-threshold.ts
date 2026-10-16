import assert from "node:assert/strict";
import { mock } from "node:test";
import { config } from "../src/server/config";
import { getPool } from "../src/server/db";
import { searchSimilar } from "../src/server/rag/store";
import type { ChatSource } from "../src/types";

async function main() {
  const oldThreshold = process.env.RAG_MIN_SIMILARITY;
  const oldDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://localhost/threshold-test-unused";
  const pool = getPool();
  const vector = [1, ...Array<number>(383).fill(0)];
  const source = (chunkIndex: number, score: number): ChatSource => ({ source: "umbral.md", chunkIndex, score, content: "Fragmento de prueba" });
  const rows = [source(0, 0.4 + 1e-9), source(1, 0.4), source(2, 0.4 - 1e-9)];
  const query = mock.method(pool, "query", async () => ({ rows }));
  try {
    delete process.env.RAG_MIN_SIMILARITY;
    assert.equal(config.rag.minSimilarity, 0.15);
    process.env.RAG_MIN_SIMILARITY = "0.4";
    assert.deepEqual(await searchSimilar(vector), rows.slice(0, 2), "Conservar mayores e iguales; excluir menores sin redondeo");
    process.env.RAG_MIN_SIMILARITY = "0.5";
    assert.deepEqual(await searchSimilar(vector), [], "Todos los resultados quedan bajo el umbral");

    for (const value of ["", "  ", "abc", "NaN", "Infinity", "-1.01", "1.01"]) {
      process.env.RAG_MIN_SIMILARITY = value;
      const before = query.mock.callCount();
      await assert.rejects(searchSimilar(vector), /RAG_MIN_SIMILARITY/);
      assert.equal(query.mock.callCount(), before, "Una configuración inválida debe fallar antes de consultar");
    }
    for (const value of ["-1", "0", "1"]) {
      process.env.RAG_MIN_SIMILARITY = value;
      assert.equal(config.rag.minSimilarity, Number(value));
    }
    console.log("OK: valor por defecto, configuración, scores debajo/igual/encima, filtro vacío y configuración inválida; sin servicios externos.");
  } finally {
    query.mock.restore();
    if (oldThreshold === undefined) delete process.env.RAG_MIN_SIMILARITY;
    else process.env.RAG_MIN_SIMILARITY = oldThreshold;
    if (oldDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = oldDatabaseUrl;
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Prueba de umbral fallida:", error instanceof Error ? error.message : "error desconocido");
  process.exitCode = 1;
});
