import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { getPool } from "@/server/db";
import { ingestDocument } from "@/server/rag/ingest";

/**
 * TODO (Integrante A): script CLI de ingesta. Uso: pnpm ingest
 *
 * Qué debe hacer:
 *  - Leer los .md / .txt de docs/knowledge/ (ignorar preguntas-evaluacion.md: no es base de conocimiento).
 *  - Llamar a ingestDocument(nombreArchivo, texto) de "@/server/rag/ingest" por cada archivo.
 *  - Mostrar por consola cuántos fragmentos se guardaron por archivo.
 *  - Cerrar el pool de Postgres al terminar (getPool().end() de "@/server/db"), o el proceso no termina.
 *  - Salir con código distinto de 0 si algo falla.
 *
 * Reto: soportar PDF, o saltarse los archivos que no cambiaron desde la última ingesta.
 *
 * Nota: el comando carga .env.local con `tsx --env-file=.env.local` (ver package.json).
 */
async function main(): Promise<void> {
  const knowledgeDirectory = path.join(process.cwd(), "docs", "knowledge");
  const pool = getPool();
  let ingestionError: unknown;

  try {
    // Leemos los nombres una sola vez y los ordenamos para repetir la misma secuencia en cada ejecución.
    const directoryEntries = await readdir(knowledgeDirectory, { withFileTypes: true });
    directoryEntries.sort((leftEntry, rightEntry) => {
      if (leftEntry.name < rightEntry.name) {
        return -1;
      }

      if (leftEntry.name > rightEntry.name) {
        return 1;
      }

      return 0;
    });

    for (const directoryEntry of directoryEntries) {
      if (!directoryEntry.isFile()) {
        continue;
      }

      const fileName = directoryEntry.name;
      // Solo se indexan documentos Markdown y texto; el archivo de preguntas no es una fuente de conocimiento.
      const extension = path.extname(fileName).toLowerCase();
      if (extension !== ".md" && extension !== ".txt") {
        continue;
      }

      if (fileName === "preguntas-evaluacion.md") {
        continue;
      }

      const filePath = path.join(knowledgeDirectory, fileName);
      const text = await readFile(filePath, "utf8");
      const savedChunkCount = await ingestDocument(fileName, text);

      console.log(`${fileName}: ${savedChunkCount} fragmentos guardados.`);
    }
  } catch (error) {
    // Conservamos el error de lectura o ingesta como causa principal si también falla el cierre.
    ingestionError = error;
    throw error;
  } finally {
    try {
      await pool.end();
    } catch (closeError) {
      if (ingestionError === undefined) {
        throw closeError;
      }

      console.error("También falló el cierre del pool de Postgres:", closeError);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
