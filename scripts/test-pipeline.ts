import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { PassThrough } from "node:stream";
import { mock } from "node:test";
import { config } from "../src/server/config";
import { getPool, toVectorLiteral } from "../src/server/db";
import { answerQuestion } from "../src/server/rag/pipeline";
import type { ChatMessage, ChatSource } from "../src/types";

async function simulated() {
  const oldThreshold = process.env.RAG_MIN_SIMILARITY;
  process.env.RAG_MIN_SIMILARITY = "0.5";
  const oldDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://localhost/pipeline-test-unused";
  const pool = getPool();
  const oldKey = process.env.GROQ_API_KEY;
  const mutableConfig = config.llm as { provider: string };
  const oldProvider = mutableConfig.provider;
  const vector = [1, ...Array<number>(383).fill(0)];
  const sampleSources: ChatSource[] = [
    { source: "prueba.md", chunkIndex: 3, content: "RAG combina búsqueda y generación.", score: 0.8 },
    { source: "prueba.md", chunkIndex: 0, content: "Los documentos aportan contexto.", score: 0.5 },
  ];
  const belowThreshold: ChatSource = { source: "prueba.md", chunkIndex: 2, content: "No debe llegar al prompt.", score: 0.5 - 1e-9 };
  let sources = [...sampleSources, belowThreshold];
  let failure: "embedding" | "search" | "llm" | undefined;
  const events: string[] = [];
  const history: ChatMessage[] = [
    { role: "user", content: "Pregunta anterior" },
    { role: "assistant", content: "Respuesta anterior" },
    { role: "user", content: "  ¿Qué es RAG?  " },
  ];
  const originalHistory = structuredClone(history);
  const python = mock.method(childProcess, "execFile", (
    _file: string, _args: readonly string[], _options: unknown,
    callback: (error: Error | null, stdout: string, stderr: string) => void,
  ) => {
    events.push("embedding");
    const stdin = new PassThrough();
    let input = "";
    stdin.on("data", (chunk) => { input += chunk.toString(); });
    stdin.on("finish", () => {
      assert.deepEqual(JSON.parse(input), ["¿Qué es RAG?"]);
      callback(failure === "embedding" ? new Error("Error simulado de embedding") : null,
        JSON.stringify([vector]), "");
    });
    const child = new childProcess.ChildProcess();
    child.stdin = stdin;
    return child;
  });
  const database = mock.method(pool, "query", async (_sql: unknown, params?: unknown[]) => {
    events.push("search");
    assert.deepEqual(params, [toVectorLiteral(vector), 4]);
    if (failure === "search") throw new Error("Error simulado de búsqueda");
    return { rows: sources };
  });
  const llm = mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
    events.push("llm");
    const body = JSON.parse(options?.body as string);
    assert.deepEqual(body.messages.slice(1), originalHistory);
    assert.equal(body.messages[0].role, "system");
    assert.match(body.messages[0].content, /prueba.md#3/);
    assert.match(body.messages[0].content, /prueba.md#0/);
    assert.ok(!body.messages[0].content.includes("prueba.md#2"), "El fragmento bajo el umbral no debe llegar al prompt");
    assert.equal(body.messages.filter((message: ChatMessage) => message.content === history[2].content).length, 1);
    if (failure === "llm") return new Response("simulado", { status: 429 });
    return Response.json({ choices: [{ message: { content: "RAG combina búsqueda y generación [prueba.md#3]." } }] });
  });
  try {
    mutableConfig.provider = "groq";
    process.env.GROQ_API_KEY = "placeholder-for-tests-only";
    for (const invalid of [undefined, null, [], [{}], [{ role: "system", content: "reglas" }],
      [{ role: "user", content: 42 }], [{ role: "user", content: " \n " }],
      [{ role: "assistant", content: "No es una pregunta de usuario" }], Array(1)]) {
      await assert.rejects(answerQuestion(invalid as ChatMessage[]), /answerQuestion:/);
    }
    assert.deepEqual(events, [], "La validación debe preceder a todo efecto externo");

    const result = await answerQuestion(history);
    assert.deepEqual(events, ["embedding", "search", "llm"]);
    assert.equal(result.answer, "RAG combina búsqueda y generación [prueba.md#3].");
    assert.deepEqual(result.sources, sampleSources);
    assert.deepEqual(history, originalHistory);

    mutableConfig.provider = "desconocido";
    delete process.env.GROQ_API_KEY;
    for (const emptyOrFiltered of [[], [belowThreshold]]) {
      sources = emptyOrFiltered;
      events.length = 0;
      assert.deepEqual(await answerQuestion(history), {
        answer: "No dispongo de información suficiente en los fragmentos proporcionados para responder esa pregunta.",
        sources: [],
      });
      assert.deepEqual(events, ["embedding", "search"], "Sin fuentes o tras filtrarlas no debe seleccionarse ni llamarse al LLM");
    }

    sources = sampleSources;
    mutableConfig.provider = "groq";
    process.env.GROQ_API_KEY = "placeholder-for-tests-only";
    for (const stage of ["embedding", "search", "llm"] as const) {
      failure = stage;
      events.length = 0;
      await assert.rejects(answerQuestion(history), stage === "embedding" ? /Python falló/
        : stage === "search" ? /Error simulado de búsqueda/ : /HTTP 429/);
      assert.deepEqual(events, stage === "embedding" ? ["embedding"]
        : stage === "search" ? ["embedding", "search"] : ["embedding", "search", "llm"]);
    }
    failure = undefined;
    events.length = 0;
    mutableConfig.provider = "desconocido";
    await assert.rejects(answerQuestion(history), /LLM_PROVIDER desconocido/);
    assert.deepEqual(events, ["embedding", "search"]);
    console.log("OK: validación, coordinación, historial sin duplicación, fuentes, contexto vacío y errores; sin Python, PostgreSQL ni API reales.");
  } finally {
    python.mock.restore();
    database.mock.restore();
    llm.mock.restore();
    mutableConfig.provider = oldProvider;
    if (oldKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = oldKey;
    if (oldDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = oldDatabaseUrl;
    if (oldThreshold === undefined) delete process.env.RAG_MIN_SIMILARITY;
    else process.env.RAG_MIN_SIMILARITY = oldThreshold;
    await pool.end();
  }
}

async function live() {
  const question = "¿Qué es RAG? Responde en una o dos frases y cita los fragmentos proporcionados.";
  const originalFetch = globalThis.fetch;
  let calls = 0;
  const guard = mock.method(globalThis, "fetch", (...args: Parameters<typeof fetch>) => {
    if (++calls > 1) throw new Error("La prueba permite una sola llamada real a Groq.");
    return originalFetch(...args);
  });
  try {
    console.log("LLM_PROVIDER=" + config.llm.provider);
    console.log("GROQ_MODEL=" + config.llm.groq.model);
    const result = await answerQuestion([{ role: "user", content: question }]);
    assert.equal(calls, 1);
    assert.ok(result.sources.length > 0);
    console.log("Pregunta:", question);
    console.log("Respuesta:\n" + result.answer);
    console.table(result.sources.map((source) => ({
      source: source.source,
      chunkIndex: source.chunkIndex,
      score: Number(source.score.toFixed(6)),
      excerpt: source.content.replace(/\s+/g, " ").slice(0, 140),
    })));
    const references = new Set(result.sources.map((source) => `${encodeURIComponent(source.source)}#${source.chunkIndex}`));
    const cited = [...result.answer.matchAll(/\[([^\]\n]+)\]/g)].map((match) => match[1]);
    assert.ok(cited.length > 0 && cited.every((reference) => references.has(reference)));
    console.log("Referencias citadas existentes:", cited.join(", "));
    console.log("Las citas existentes no demuestran por sí solas fidelidad factual.");
  } finally {
    guard.mock.restore();
    await getPool().end();
  }
}

(process.argv.includes("--live") ? live() : simulated()).catch((error: unknown) => {
  console.error("Prueba del pipeline fallida:", error instanceof Error ? error.message : "error desconocido");
  process.exitCode = 1;
});
