import * as fs from "node:fs";
import * as path from "node:path";
import { getPool } from "@/server/db";
import { ingestDocument } from "@/server/rag/ingest";

// Archivos que NO son base de conocimiento: no deben ingerirse.
// preguntas-evaluacion.md es la batería de examen (Hito 4), no una fuente.
const IGNORED_FILES = new Set(["preguntas-evaluacion.md"]);

async function main() {
  // Carpeta con los documentos, ubicada en la raíz del proyecto.
  const knowledgeDir = path.join(process.cwd(), "docs", "knowledge");

  // Lista los .md / .txt de esa carpeta, descartando los ignorados.
  const files = fs
    .readdirSync(knowledgeDir)
    .filter((file) => (file.endsWith(".md") || file.endsWith(".txt")) && !IGNORED_FILES.has(file));

  // Procesa cada archivo en orden: logs claros y menor consumo de memoria.
  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    const text = fs.readFileSync(filePath, "utf-8");

    // `file` (nombre del archivo) se usa como `source` para poder citarlo.
    const count = await ingestDocument(file, text);

    console.log(`✓ ${file}: ${count} fragmentos`);
  }

  // Cierra el pool de Postgres. Sin esto, Node mantiene el proceso vivo
  // (las conexiones abiertas impiden que el script termine).
  await getPool().end();
}

// El manejo de errores ya existía: si algo falla, sale con código != 0.
main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
