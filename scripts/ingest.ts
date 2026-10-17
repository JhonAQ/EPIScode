/**
 * CLI de ingesta. Uso: pnpm ingest
 * Adaptador de entrada: lee docs/knowledge/*.md|txt y delega en el caso de uso IngestDocument.
 *
 * TODO (Integrante A): retos
 *  - soportar PDF
 *  - saltarse los archivos que no cambiaron desde la última ingesta
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getIngestDocument } from "@/server/composition/container";
import { closePool } from "@/server/infrastructure/persistence/postgres/pool";

const KNOWLEDGE_DIR = path.join(process.cwd(), "docs", "knowledge");
const IGNORED = new Set(["preguntas-evaluacion.md"]); // es el set de evaluación, no base de conocimiento

async function main() {
  const files = (await readdir(KNOWLEDGE_DIR)).filter(
    (f) => /\.(md|txt)$/i.test(f) && !IGNORED.has(f),
  );
  const ingest = getIngestDocument();

  for (const file of files) {
    const text = await readFile(path.join(KNOWLEDGE_DIR, file), "utf8");
    const count = await ingest.execute({ source: file, text });
    console.log(`${file}: ${count} fragmentos`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closePool);
