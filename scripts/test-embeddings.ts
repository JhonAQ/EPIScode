import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { embedQuery, embedTexts } from "../src/server/rag/embeddings";

async function main() {
  const root = process.cwd();
  // En este directorio no hay .venv: [] debe funcionar sin crear un proceso.
  process.chdir(os.tmpdir());
  try {
    assert.deepEqual(await embedTexts([]), []);
    await assert.rejects(embedQuery("prueba"), /Embeddings locales:/);
  } finally {
    process.chdir(root);
  }
  await assert.rejects(embedTexts([42 as unknown as string]), /lista de textos/);

  const texts = ["La UNSA está en Arequipa.", '¿Dónde está la UNSA? " ; $(echo prueba)\n', "La UNSA está en Arequipa."];
  const vectors = await embedTexts(texts);
  const query = await embedQuery(texts[1]);
  assert.equal(vectors.length, texts.length);
  for (const vector of [...vectors, query]) {
    assert.equal(vector.length, 384);
    assert.ok(vector.every(Number.isFinite));
  }
  const close = (left: number[], right: number[]) =>
    left.every((value, index) => Math.abs(value - right[index]) < 1e-5);
  assert.ok(close(vectors[0], vectors[2]), "Textos duplicados conservan sus posiciones");
  assert.ok(close(vectors[1], query), "Pregunta y lote usan el mismo modelo");
  assert.ok(!close(vectors[0], vectors[1]), "Textos distintos producen vectores distintos");

  await new Promise<void>((resolve, reject) => {
    const python = path.join(root, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
    const child = execFile(python, ["-I", "scripts/embed_local.py"], { encoding: "utf8" }, (error, stdout, stderr) => {
      try {
        assert.ok(error, "JSON incorrecto debe fallar");
        assert.equal(stdout, "");
        assert.match(stderr, /Embeddings locales: JSONDecodeError/);
        resolve();
      } catch (failure) {
        reject(failure);
      }
    });
    child.stdin?.on("error", reject);
    child.stdin?.end("{");
  });
  console.log("OK: lote real [3, 384], consulta [384], orden, finitud, consistencia, entrada vacía y errores.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
