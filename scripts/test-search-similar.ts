import assert from "node:assert/strict";
import { mock } from "node:test";
import { config } from "../src/server/config";
import { getPool, toVectorLiteral } from "../src/server/db";
import { embedQuery } from "../src/server/rag/embeddings";
import { searchSimilar } from "../src/server/rag/store";

async function main() {
  const pool = getPool();
  const unitVector = [1, ...Array<number>(383).fill(0)];
  try {
    // Las entradas inválidas se rechazan antes de cualquier consulta a PostgreSQL.
    const blocked = mock.method(pool, "query", async () => {
      throw new Error("No debe consultarse PostgreSQL con entradas inválidas.");
    });
    try {
      for (const vector of [[], [1], Array<number>(384).fill(NaN), Array<number>(384).fill(Infinity),
        Array<number>(384), Array<string>(384).fill("1") as unknown as number[],
        null as unknown as number[]]) {
        await assert.rejects(searchSimilar(vector), /384 números finitos/);
      }
      await assert.rejects(searchSimilar(Array<number>(384).fill(0)), /norma distinta de cero/);
      for (const topK of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "2" as unknown as number]) {
        await assert.rejects(searchSimilar(unitVector, topK), /entero positivo/);
      }
      assert.equal(blocked.mock.callCount(), 0);
    } finally {
      blocked.mock.restore();
    }

    // Simular cero filas sin borrar ni modificar los documentos reales.
    const empty = mock.method(pool, "query", async () => ({ rows: [] }));
    try {
      assert.deepEqual(await searchSimilar(unitVector, 2), []);
      const call = empty.mock.calls[0];
      assert.match(call.arguments[0] as string, /ORDER BY embedding <=> \$1::vector ASC/);
      assert.match(call.arguments[0] as string, /LIMIT \$2/);
      assert.deepEqual(call.arguments[1], [toVectorLiteral(unitVector), 2]);
    } finally {
      empty.mock.restore();
    }

    const question = "¿Qué es RAG y para qué sirve en un chatbot?";
    const vector = await embedQuery(question);
    const results = await searchSimilar(vector);
    assert.ok(results.length > 0 && results.length <= 4);
    for (const [index, result] of results.entries()) {
      assert.deepEqual(Object.keys(result).sort(), ["chunkIndex", "content", "score", "source"]);
      assert.ok(Number.isInteger(result.chunkIndex));
      assert.ok(Number.isFinite(result.score));
      if (index > 0) assert.ok(results[index - 1].score >= result.score);
    }
    // Calcular coseno en JS de forma independiente sobre los vectores guardados.
    const stored = await pool.query(
      `SELECT source, chunk_index AS "chunkIndex", content,
              embedding::text AS embedding FROM chunks`,
    );
    const expected = stored.rows.map((row) => {
      const documentVector = JSON.parse(row.embedding) as number[];
      const dot = vector.reduce((sum, value, index) => sum + value * documentVector[index], 0);
      return { ...row, score: dot / (Math.hypot(...vector) * Math.hypot(...documentVector)) };
    }).sort((left, right) => right.score - left.score).slice(0, 4)
      .filter((row) => row.score >= config.rag.minSimilarity);
    assert.equal(results.length, expected.length);
    for (const [index, result] of results.entries()) {
      const row = expected[index];
      assert.equal(result.source, row.source);
      assert.equal(result.chunkIndex, row.chunkIndex);
      assert.equal(result.content, row.content);
      assert.ok(Math.abs(result.score - row.score) < 1e-6);
    }
    const topOne = await searchSimilar(vector, 1);
    assert.equal(topOne.length, 1);
    assert.deepEqual(topOne[0], results[0]);
    assert.ok((await searchSimilar(vector, 100)).length <= 100);

    console.log("Pregunta:", question);
    console.table(results.map((result) => ({
      source: result.source,
      chunkIndex: result.chunkIndex,
      distance: Number((1 - result.score).toFixed(6)),
      score: Number(result.score.toFixed(6)),
      excerpt: result.content.replace(/\s+/g, " ").slice(0, 160),
    })));
    console.log("OK: búsqueda real, orden, topK, similitud, entradas inválidas sin consultas y respuesta vacía simulada.");
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Prueba de búsqueda fallida:", error instanceof Error ? error.message : "error desconocido");
  process.exitCode = 1;
});
