import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { ingestDocuments } from "../src/server/rag/ingest";
import { getPool } from "../src/server/db";
async function main() {
  const directory = path.resolve("docs/knowledge");
  const files = (await readdir(directory, { withFileTypes: true })).filter(f => f.isFile() && /\.(md|txt)$/i.test(f.name) && f.name.toLowerCase() !== "preguntas-evaluacion.md").map(f => f.name).sort();
  if (process.argv.includes("--list")) { console.log(files.join("\n")); return; }
  if (!files.length && !process.argv.includes("--allow-empty")) throw new Error("No hay documentos para ingerir. Usa --allow-empty para vaciar el corpus explícitamente.");
  try {
    const documents: { source: string; text: string }[] = [];
    for (const file of files) {
      documents.push({ source: file, text: await readFile(path.join(directory, file), "utf8") });
    }
    const results = await ingestDocuments(documents);
    for (const { source, count } of results) console.log(source + ": " + count + " fragmentos guardados");
    console.log("Corpus sincronizado: " + results.length + " documentos.");
  } finally { await getPool().end(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Error de ingesta"); process.exitCode = 1; });
