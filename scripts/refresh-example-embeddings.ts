import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFile, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { getPool } from "../src/server/db";
import { ingestDocument } from "../src/server/rag/ingest";

async function main() {
  const pool = getPool();
  try {
    const baseline = JSON.parse(await readFile(new URL("../docs/evaluacion/recuperacion-mediciones.json", import.meta.url), "utf8"));
    const corpus = (await pool.query(
      'SELECT source, chunk_index AS "chunkIndex", content, embedding::text AS embedding FROM chunks ORDER BY source, chunk_index',
    )).rows;
    assert.equal(createHash("sha256").update(JSON.stringify(corpus)).digest("hex"), baseline.corpusHash,
      "El corpus cambió desde la calibración; revisar antes de regenerar");
    for (const extension of ["json", "md"]) {
      await copyFile(new URL(`../docs/evaluacion/recuperacion-mediciones.${extension}`, import.meta.url),
        new URL(`../docs/evaluacion/recuperacion-baseline-128.${extension}`, import.meta.url), constants.COPYFILE_EXCL);
    }
    const previous = (await pool.query("SELECT id, chunk_index FROM chunks WHERE source = $1 ORDER BY chunk_index", ["ejemplo-rag.md"])).rows;
    const text = await readFile(new URL("../docs/knowledge/ejemplo-rag.md", import.meta.url), "utf8");
    assert.equal(await ingestDocument("ejemplo-rag.md", text), 5);
    const current = (await pool.query("SELECT id, chunk_index, vector_dims(embedding) AS dimensions FROM chunks WHERE source = $1 ORDER BY chunk_index", ["ejemplo-rag.md"])).rows;
    assert.deepEqual(current.map(({ id, chunk_index }) => ({ id, chunk_index })), previous);
    assert.ok(current.every((row) => row.dimensions === 384));
    console.log("Regenerados 5 embeddings a max_seq_length=256; mismos IDs e índices, 384 dimensiones. Sin llamadas a LLM.");
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Regeneración fallida:", error instanceof Error ? error.message : "error desconocido");
  process.exitCode = 1;
});
