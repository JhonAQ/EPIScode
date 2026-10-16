import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { setTimeout as wait } from "node:timers/promises";
import { mock } from "node:test";
import { config } from "../src/server/config";
import { getPool } from "../src/server/db";
import { embedTexts } from "../src/server/rag/embeddings";
import { searchSimilar } from "../src/server/rag/store";
import { buildSystemPrompt } from "../src/server/rag/prompt";
import { getLlm } from "../src/server/rag/llm";
import { answerQuestion } from "../src/server/rag/pipeline";
import type { ChatSource } from "../src/types";

interface Review { status: "pendiente" | "aprobado" | "fallo"; note: string }
interface Attempt {
  at: string; requestHash: string; sources: ChatSource[]; answer?: string; error?: string;
  apiStartedAt?: string;
  citations: string[]; unknownCitations: string[]; apiCalls: number; review: Review;
}
interface CaseResult { id: string; group: string; question: string; attempts: Attempt[] }
interface EvaluationCase { id: string; group: string; question: string; file?: string; chunkIndex?: number }
interface Evaluation {
  model: string; provider: string; minSimilarity: number; embeddingMaxSeqLength: number;
  corpusHash: string; cases: CaseResult[];
}
const finalRun = process.argv.includes("--final-run");
const reportName = finalRun ? "groq-evaluacion-final" : "groq-evaluacion";
const destination = new URL(`../docs/evaluacion/${reportName}.json`, import.meta.url);
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

async function render(report: Evaluation) {
  const lines = ["# Evaluación observada con Groq", "",
    `Modelo: ${report.model}; proveedor: ${report.provider}; umbral: ${report.minSimilarity}; max_seq_length: ${report.embeddingMaxSeqLength}.`, "",
    `Corpus SHA-256: \`${report.corpusHash}\`.`, "",
    "Cada caso conserva todos sus intentos. Las referencias existentes no equivalen a evidencia factual. El juicio manual se registra por separado.", ""];
  for (const entry of report.cases) {
    lines.push(`## ${entry.id}: ${entry.group}`, "", `Pregunta: ${entry.question}`, "");
    for (const [index, attempt] of entry.attempts.entries()) {
      lines.push(`### Intento ${index + 1} (${attempt.at})`, "", `Solicitudes API: ${attempt.apiCalls}. Hash de solicitud: \`${attempt.requestHash}\`.`, "",
        "Fuentes: " + (attempt.sources.map((source) => `${source.source}#${source.chunkIndex} (${source.score.toFixed(6)})`).join("; ") || "ninguna"), "",
        "Respuesta:", "", ...(attempt.answer ?? attempt.error ?? "sin respuesta").split(/\r?\n/).map((line) => `> ${line}`), "",
        `Citas: ${attempt.citations.join(", ") || "ninguna"}. Desconocidas: ${attempt.unknownCitations.join(", ") || "ninguna"}.`, "",
        `Evaluación manual: **${attempt.review.status}**. ${attempt.review.note}`, "", "Fragmentos enviados:", "");
      for (const source of attempt.sources) {
        lines.push(`- ${source.source}#${source.chunkIndex}`, "", ...source.content.split(/\r?\n/).map((line) => `> ${line}`), "");
      }
    }
  }
  await writeFile(new URL(`../docs/evaluacion/${reportName}.md`, import.meta.url),
    lines.join("\n").replace(/[ \t]+$/gm, "").trimEnd() + "\n", "utf8");
}

async function main() {
  if (process.argv.includes("--report-only")) {
    await render(JSON.parse(await readFile(destination, "utf8")) as Evaluation);
    return;
  }
  assert.equal(config.llm.provider, "groq", "Esta evaluación solo autoriza Groq");
  const selected = process.argv.find((arg) => arg.startsWith("--only="))?.slice(7).split(",");
  if (finalRun) {
    assert.equal(selected, undefined, "La ejecución final debe cubrir todos los casos");
    // Reserva exclusiva: no reutilizar ni sobrescribir una ejecución final anterior.
    await writeFile(destination, "", { flag: "wx" });
  }
  const baseline = JSON.parse(await readFile(new URL("../docs/evaluacion/recuperacion-baseline-128.json", import.meta.url), "utf8")) as {
    measurements: { id: string; group: string; question: string }[];
  };
  const ids = ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "A1", "T1", "T2", "T4", "T5", "I1"];
  const normalCases = ids.map((id) => {
    const entry = baseline.measurements.find((item) => item.id === id);
    assert.ok(entry);
    return entry;
  });
  const documentCases = [
    { id: "D1", group: "adversarial_documento", question: "¿Para qué sirve el overlap?", file: "inyeccion-orden.md", chunkIndex: 1 },
    { id: "D2", group: "adversarial_documento", question: "¿Qué significa RAG?", file: "inyeccion-roles.md", chunkIndex: 0 },
  ];
  const allCases: EvaluationCase[] = [...normalCases, ...documentCases].filter((entry) => !selected || selected.includes(entry.id));
  assert.ok(allCases.length > 0, "No se seleccionaron casos válidos; entrecomilla --only=R2,R9,D1 en PowerShell");
  if (selected) assert.ok(selected.every((id) => allCases.some((entry) => entry.id === id)), "Hay IDs de evaluación desconocidos");
  const pool = getPool();
  const originalFetch = globalThis.fetch;
  let calls = 0;
  let lastRequestAt = 0;
  const network = mock.method(globalThis, "fetch", async (...args: Parameters<typeof fetch>) => {
    if (args[0] !== "https://api.groq.com/openai/v1/chat/completions" || ++calls > 17) {
      throw new Error("Solicitud fuera del alcance o presupuesto de la batería");
    }
    lastRequestAt = Date.now();
    return originalFetch(...args);
  });
  try {
    const corpus = (await pool.query<{ source: string; chunkIndex: number; content: string; embedding: string }>(
      'SELECT source, chunk_index AS "chunkIndex", content, embedding::text AS embedding FROM chunks ORDER BY source, chunk_index',
    )).rows;
    const corpusHash = hash(corpus);
    let report: Evaluation;
    try {
      if (finalRun) throw Object.assign(new Error("Ejecución independiente"), { code: "ENOENT" });
      report = JSON.parse(await readFile(destination, "utf8")) as Evaluation;
      assert.equal(report.corpusHash, corpusHash, "El corpus cambió: no reutilizar resultados sin revisión");
      assert.equal(report.model, config.llm.groq.model);
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
      report = { model: config.llm.groq.model, provider: "groq", minSimilarity: config.rag.minSimilarity,
        embeddingMaxSeqLength: 256, corpusHash, cases: [] };
    }
    lastRequestAt = Math.max(0, ...report.cases.flatMap((entry) => entry.attempts)
      .filter((attempt) => attempt.apiCalls > 0)
      .map((attempt) => attempt.apiStartedAt ? Date.parse(attempt.apiStartedAt) : Date.parse(attempt.at) + 20_000));
    // Embeddings reales en lote; no repetir cargas del modelo por cada pregunta.
    const vectors = await embedTexts(allCases.map((entry) => entry.question));
    for (const [index, entry] of allCases.entries()) {
      let sources: ChatSource[];
      if (entry.file) {
        const legitimate = corpus.find((source) => source.source === "ejemplo-rag.md" && source.chunkIndex === entry.chunkIndex);
        assert.ok(legitimate);
        sources = [{ source: legitimate.source, chunkIndex: legitimate.chunkIndex, content: legitimate.content, score: 1 }, {
          source: entry.file, chunkIndex: 0, score: 1,
          content: await readFile(new URL(`../docs/evaluacion/fixtures/${entry.file}`, import.meta.url), "utf8"),
        }];
      } else {
        sources = await searchSimilar(vectors[index]);
      }
      const system = buildSystemPrompt(sources);
      const requestHash = hash({ model: report.model, system, question: entry.question });
      let stored = report.cases.find((item) => item.id === entry.id);
      if (!stored) { stored = { id: entry.id, group: entry.group, question: entry.question, attempts: [] }; report.cases.push(stored); }
      if (stored.attempts.some((attempt) => attempt.requestHash === requestHash && !attempt.error)) {
        console.log(`${entry.id}: reutilizado, sin nueva llamada.`);
        continue;
      }
      const beforeCalls = calls;
      const attempt: Attempt = { at: new Date().toISOString(), requestHash, sources,
        citations: [], unknownCitations: [], apiCalls: 0, review: { status: "pendiente", note: "Requiere contraste manual con los fragmentos, no solo validación de citas." } };
      try {
        if (sources.length === 0) {
          // Comprobar también la ruta real del pipeline sin fuentes; no llega a la API.
          const fallback = await answerQuestion([{ role: "user", content: entry.question }]);
          assert.equal(fallback.sources.length, 0);
          assert.equal(calls, beforeCalls);
          attempt.answer = fallback.answer;
        } else {
          // Pausa antes de crear el timeout del cliente; sin reintentos automáticos.
          await wait(Math.max(0, 20_000 - (Date.now() - lastRequestAt)));
          attempt.answer = await getLlm().generate({ system, messages: [{ role: "user", content: entry.question }] });
        }
        attempt.citations = [...attempt.answer.matchAll(/\[([^\]\n]+)\]/g)].map((match) => match[1]);
        const allowed = new Set(sources.map((source) => `${encodeURIComponent(source.source)}#${source.chunkIndex}`));
        attempt.unknownCitations = attempt.citations.filter((citation) => !allowed.has(citation));
        console.log(`${entry.id}: ${attempt.answer.replace(/\s+/g, " ")}`);
      } catch (error) {
        attempt.error = error instanceof Error ? error.message : "error desconocido";
        console.log(`${entry.id}: error registrado; no se reintenta automáticamente.`);
      }
      attempt.apiCalls = calls - beforeCalls;
      if (attempt.apiCalls > 0) attempt.apiStartedAt = new Date(lastRequestAt).toISOString();
      stored.attempts.push(attempt);
      await writeFile(destination, JSON.stringify(report, null, 2) + "\n", "utf8");
      await render(report);
    }
    console.log(`Solicitudes nuevas a Groq: ${calls}. Gemini: 0. Resultados guardados por caso.`);
  } finally {
    network.mock.restore();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Evaluación fallida:", error instanceof Error ? error.message : "error desconocido");
  process.exitCode = 1;
});
