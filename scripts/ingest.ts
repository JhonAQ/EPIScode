import { readdir, readFile } from "node:fs/promises";
import { chunkText } from "../src/server/rag/chunker";

/** CLI de ingesta. --dry-run muestra una vista previa sin guardar datos. */
async function main() {
  const dryRun = process.argv.slice(2).includes("--dry-run");
  const knowledgeDirectory = new URL("../docs/knowledge/", import.meta.url);
  let pool: ReturnType<typeof import("../src/server/db").getPool> | undefined;

  try {
    const ingestDocument = dryRun
      ? undefined
      : (await import("../src/server/rag/ingest")).ingestDocument;
    if (!dryRun) {
      const { getPool } = await import("../src/server/db");
      pool = getPool();
    }

    const entries = await readdir(knowledgeDirectory, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile()
        && /\.(md|txt)$/i.test(entry.name)
        && entry.name !== "preguntas-evaluacion.md")
      .map((entry) => entry.name)
      .sort();

    let totalChunks = 0;
    if (dryRun) {
      console.log("Vista previa (--dry-run): no se guardan datos.");
    }

    for (const filename of files) {
      const text = await readFile(new URL(encodeURIComponent(filename), knowledgeDirectory), "utf8");
      if (ingestDocument) {
        const saved = await ingestDocument(filename, text);
        totalChunks += saved;
        console.log(`${filename}: ${text.length} caracteres, ${saved} fragmentos guardados`);
      } else {
        const chunks = chunkText(text);
        totalChunks += chunks.length;
        console.log(`${filename}: ${text.length} caracteres, ${chunks.length} fragmentos`);
      }
    }

    console.log(`Total: ${files.length} archivos, ${totalChunks} fragmentos${dryRun ? "" : " guardados"}`);
  } finally {
    await pool?.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
