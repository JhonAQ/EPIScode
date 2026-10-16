import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mock } from "node:test";
import { config } from "../src/server/config";
import { chunkText } from "../src/server/rag/chunker";
import { getLlm } from "../src/server/rag/llm";
import { groqClient } from "../src/server/rag/llm/groq";
import { geminiClient } from "../src/server/rag/llm/gemini";
import { buildSystemPrompt } from "../src/server/rag/prompt";
import type { LlmRequest } from "../src/server/rag/llm/types";

async function simulated() {
  const oldKey = process.env.GROQ_API_KEY;
  const providerConfig = config.llm as { provider: string };
  const oldProvider = providerConfig.provider;
  const fakeKey = "placeholder-for-tests-only";
  const request: LlmRequest = {
    system: "Responde con el contexto.",
    messages: [
      { role: "user", content: "Primera pregunta" },
      { role: "assistant", content: "Respuesta anterior" },
      { role: "user", content: "Pregunta actual" },
    ],
  };
  const originalRequest = structuredClone(request);
  const fetchMock = mock.method(globalThis, "fetch", async () => {
    throw new Error("No debe haber ninguna llamada real en las pruebas simuladas.");
  });
  const expectError = async (pattern: RegExp) => {
    await assert.rejects(groqClient.generate(request), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, pattern);
      assert.ok(!error.message.includes(fakeKey));
      assert.equal(error.cause, undefined, "No propagar errores que puedan incluir la clave");
      return true;
    });
  };
  try {
    providerConfig.provider = "groq";
    assert.equal(getLlm(), groqClient);
    providerConfig.provider = "gemini";
    assert.equal(getLlm(), geminiClient);
    providerConfig.provider = "desconocido";
    assert.throws(() => getLlm(), /LLM_PROVIDER desconocido/);

    delete process.env.GROQ_API_KEY;
    await expectError(/GROQ_API_KEY/);
    process.env.GROQ_API_KEY = "   ";
    await expectError(/GROQ_API_KEY/);
    assert.equal(fetchMock.mock.callCount(), 0);
    process.env.GROQ_API_KEY = fakeKey;

    fetchMock.mock.mockImplementation(async (url, options) => {
      assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
      assert.equal(options?.method, "POST");
      assert.equal(options?.cache, "no-store");
      assert.equal(options?.redirect, "error");
      const headers = new Headers(options?.headers);
      assert.equal(headers.get("Authorization"), `Bearer ${fakeKey}`);
      const body = JSON.parse(options?.body as string);
      assert.equal(body.model, config.llm.groq.model);
      assert.deepEqual(body.messages, [{ role: "system", content: request.system }, ...request.messages]);
      assert.equal(body.stream, false);
      assert.equal(body.max_completion_tokens, 1024);
      return Response.json({ choices: [{ message: { content: "  Respuesta con cita [fuente#0].  ", reasoning: "No devolver" } }] });
    });
    assert.equal(await groqClient.generate(request), "Respuesta con cita [fuente#0].");
    assert.deepEqual(request, originalRequest);

    for (const status of [400, 401, 403, 429, 500, 503]) {
      fetchMock.mock.mockImplementation(async () => new Response(fakeKey, { status, statusText: fakeKey }));
      await expectError(new RegExp(`HTTP ${status}`));
    }
    fetchMock.mock.mockImplementation(async () => { throw new Error(fakeKey); });
    await expectError(/no se pudo conectar/);
    fetchMock.mock.mockImplementation(async () => new Response("no es JSON"));
    await expectError(/JSON inválida/);
    for (const payload of [null, {}, { choices: [] }, { choices: [{ message: { content: "  " } }] },
      { choices: [{ message: { content: null } }] }, { choices: [{ message: { content: 42 } }] }]) {
      fetchMock.mock.mockImplementation(async () => Response.json(payload));
      await expectError(/respuesta vacía/);
    }

    const timeoutMock = mock.method(AbortSignal, "timeout", () => AbortSignal.abort(new DOMException("simulado", "TimeoutError")));
    try {
      fetchMock.mock.mockImplementation(async (_url, options) => { throw options?.signal?.reason; });
      await expectError(/tiempo de espera agotado/);
      fetchMock.mock.mockImplementation(async () => new Response(new ReadableStream({
        start(controller) { controller.error(new DOMException("simulado", "TimeoutError")); },
      })));
      await expectError(/tiempo de espera agotado/);
    } finally {
      timeoutMock.mock.restore();
    }
    console.log("OK: selector, orden, modelo, texto, clave ausente, timeout, red, HTTP, JSON y respuesta vacía; sin llamadas reales.");
  } finally {
    fetchMock.mock.restore();
    providerConfig.provider = oldProvider;
    if (oldKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = oldKey;
  }
}

async function live() {
  const text = await readFile(new URL("../docs/knowledge/ejemplo-rag.md", import.meta.url), "utf8");
  const sources = chunkText(text).slice(0, 2).map((chunk) => ({
    source: "ejemplo-rag.md", chunkIndex: chunk.index, content: chunk.content, score: 1,
  }));
  const question = "¿Qué es RAG? Responde en una o dos frases y cita los fragmentos proporcionados.";
  const client = getLlm();
  const originalFetch = globalThis.fetch;
  let calls = 0;
  const guard = mock.method(globalThis, "fetch", (...args: Parameters<typeof fetch>) => {
    if (++calls > 1) throw new Error("La prueba permite una sola llamada real.");
    return originalFetch(...args);
  });
  let answer: string;
  try {
    answer = await client.generate({ system: buildSystemPrompt(sources), messages: [{ role: "user", content: question }] });
  } finally {
    guard.mock.restore();
  }
  assert.equal(calls, 1);
  console.log("Respuesta real:\n" + answer);
  const references = new Set(sources.map((source) => `${encodeURIComponent(source.source)}#${source.chunkIndex}`));
  const cited = [...answer.matchAll(/\[([^\]\n]+)\]/g)].map((match) => match[1]);
  console.log("Referencias citadas:", cited.join(", ") || "ninguna");
  assert.ok(cited.length > 0, "Se esperaba al menos una cita");
  assert.ok(cited.every((reference) => references.has(reference)), "Hay referencias ajenas al contexto enviado");
  console.log("OK: las referencias existen en el contexto enviado. Esto no demuestra por sí solo fidelidad factual.");
}

(process.argv.includes("--live") ? live() : simulated()).catch((error: unknown) => {
  console.error("Prueba Groq fallida:", error instanceof Error ? error.message : "error desconocido");
  process.exitCode = 1;
});
