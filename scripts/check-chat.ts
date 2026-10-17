import { answerQuestion } from "../src/server/rag/pipeline";
import { getPool } from "../src/server/db";
answerQuestion([{ role: "user", content: "¿Qué significa RAG?" }])
  .then(result => console.log(JSON.stringify(result)))
  .catch(error => { console.error(error instanceof Error ? error.message : "Error"); process.exitCode = 1; })
  .finally(() => getPool().end());
