import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { getPool } from "../src/server/db";
import { chunkText } from "../src/server/rag/chunker";
import { ingestDocument } from "../src/server/rag/ingest";
import { saveChunks } from "../src/server/rag/store";

async function main() {
  const pool = getPool();
  const source = "ejemplo-rag.md";
  const fixture = `test-saveChunks-${randomUUID()}'; --`;
  let fixtureCreated = false;
  const snapshot = async (name: string) => (await pool.query<{
    id: string; chunk_index: number; content: string; metadata: Record<string, unknown>;
    dimensions: number; embedding: string;
  }>(`SELECT id, chunk_index, content, metadata, vector_dims(embedding) AS dimensions,
             embedding::text AS embedding
      FROM chunks WHERE source = $1 ORDER BY chunk_index`, [name])).rows;

  try {
    const text = await readFile(new URL("../docs/knowledge/ejemplo-rag.md", import.meta.url), "utf8");
    const expected = chunkText(text);
    assert.equal(expected.length, 5);
    assert.equal(await ingestDocument(source, text), 5);
    const first = await snapshot(source);
    assert.equal(first.length, 5);
    for (const [index, row] of first.entries()) {
      assert.equal(row.chunk_index, expected[index].index);
      assert.equal(row.content, expected[index].content);
      assert.deepEqual(row.metadata, expected[index].metadata ?? {});
      assert.equal(row.dimensions, 384);
      const vector = JSON.parse(row.embedding) as number[];
      assert.equal(vector.length, 384);
      assert.ok(vector.every(Number.isFinite));
    }
    console.log("Primera ingesta real: ejemplo-rag.md, 5 registros, 384 dimensiones y valores finitos.");
    assert.equal(await ingestDocument(source, text), 5);
    const second = await snapshot(source);
    assert.equal(second.length, 5);
    assert.deepEqual(second.map((row) => row.id), first.map((row) => row.id));
    console.log("Segunda ingesta real: 5 registros, mismos IDs, sin duplicados.");

    const vector = JSON.parse(second[0].embedding) as number[];
    await saveChunks(fixture, [
      { index: 0, content: "Anterior", metadata: { version: 1 } },
      { index: 3, content: "Sobrante", metadata: { section: "UNSA" } },
    ], [vector, vector]);
    fixtureCreated = true;
    const original = await snapshot(fixture);

    // La segunda fila falla en PostgreSQL: la primera actualización debe revertirse.
    const outOfRange = vector.map(() => Number.MAX_VALUE);
    await assert.rejects(saveChunks(fixture, [
      { index: 0, content: "No debe persistir" },
      { index: 1, content: "Vector fuera del rango float32" },
    ], [vector, outOfRange]), /se revirtió la transacción/);
    assert.deepEqual(await snapshot(fixture), original);

    await assert.rejects(saveChunks(fixture, [{ index: 0, content: "Inválido" }], [[NaN]]), /384 números finitos/);
    await assert.rejects(saveChunks(fixture, [{ index: 0, content: "Sin vector" }], []), /un embedding por fragmento/);
    assert.deepEqual(await snapshot(fixture), original);

    await saveChunks(fixture, [{ index: 0, content: "Actualizado", metadata: { version: 2, section: "Arequipa" } }], [vector]);
    const shortened = await snapshot(fixture);
    assert.equal(shortened.length, 1);
    assert.equal(shortened[0].id, original[0].id);
    assert.equal(shortened[0].content, "Actualizado");
    assert.deepEqual(shortened[0].metadata, { version: 2, section: "Arequipa" });
    assert.equal(shortened[0].embedding, second[0].embedding);
    assert.equal(await ingestDocument(fixture, " \n"), 0);
    assert.equal((await snapshot(fixture)).length, 0);
    assert.equal((await snapshot(source)).length, 5);
    console.log("OK: metadata, parámetros, rollback real, validación, eliminación de sobrantes y documento vacío.");
  } finally {
    try {
      if (fixtureCreated) await pool.query("DELETE FROM chunks WHERE source = $1", [fixture]);
    } finally {
      await pool.end();
    }
  }
}

main().catch((error: unknown) => {
  // No imprimir configuración, cadenas de conexión ni causas del cliente PostgreSQL.
  console.error("Prueba de almacenamiento fallida:", error instanceof Error ? error.message : "error desconocido");
  process.exitCode = 1;
});
