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
async function main() {
  throw new Error("TODO: implementar scripts/ingest.ts");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
