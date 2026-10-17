import assert from "node:assert/strict";
import { mock } from "node:test";
import { createChatPost } from "../src/server/chat-endpoint";
import { POST, runtime } from "../src/app/api/chat/route";
import type { ChatMessage, ChatResponse } from "../src/types";

const request = (body: unknown) => new Request("http://localhost/api/chat", {
  method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
});

async function simulated() {
  assert.equal(runtime, "nodejs");
  assert.equal(typeof POST, "function");
  let calls = 0;
  let received: ChatMessage[] = [];
  const data: ChatResponse = { answer: "Respuesta [prueba.md#2].", sources: [
    { source: "prueba.md", chunkIndex: 2, content: "Evidencia", score: 0.7 },
  ] };
  const handler = createChatPost(async (messages) => { calls++; received = messages; return data; });
  const malformed = await handler(new Request("http://localhost/api/chat", { method: "POST", body: "{" }));
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).success, false);
  for (const body of [null, [], "texto", {}, { messages: null }, { messages: {} }, { messages: [] },
    { messages: Array(21).fill({ role: "user", content: "hola" }) },
    ...[null, "texto", {}, { role: "system", content: "instrucciones" }, { role: "tool", content: "hola" },
      { role: "User", content: "hola" }, { role: "user", content: "" }, { role: "user", content: " \n\t" },
      { role: "user", content: 123 }, { role: "user", content: "x".repeat(4001) },
      { role: "assistant", content: "último inválido" }].map((message) => ({ messages: [message] }))]) {
    const response = await handler(request(body));
    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(payload.success, false);
    assert.equal(typeof payload.error, "string");
    assert.ok(!("data" in payload));
  }
  assert.equal(calls, 0, "Ninguna entrada inválida debe iniciar el pipeline");

  const history: ChatMessage[] = [
    { role: "user", content: "Pregunta anterior" }, { role: "assistant", content: "Respuesta anterior" },
    { role: "user", content: "  Pregunta actual  " },
  ];
  const response = await handler(request({ messages: history.map((message) => ({ ...message, extra: "ignorar" })) }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.match(response.headers.get("Content-Type") ?? "", /application\/json/);
  assert.deepEqual(await response.json(), { success: true, data });
  assert.deepEqual(received, history, "Conservar texto, orden y una sola pregunta actual");
  assert.equal(calls, 1);
  const atLimit = await handler(request({ messages: Array(20).fill({ role: "user", content: "x".repeat(4000) }) }));
  assert.equal(atLimit.status, 200);

  const empty = createChatPost(async () => ({ answer: "Contexto insuficiente", sources: [] }));
  assert.deepEqual(await (await empty(request({ messages: [history[2]] }))).json(), {
    success: true, data: { answer: "Contexto insuficiente", sources: [] },
  });
  const logs: unknown[][] = [];
  const logger = mock.method(console, "error", (...args: unknown[]) => { logs.push(args); });
  try {
    for (const failure of [new Error("secreto-simulado SQL DATABASE_URL Python /private"), "secreto-simulado", null]) {
      const failing = createChatPost(async () => { throw failure; });
      const result = await failing(request({ messages: [history[2]] }));
      assert.equal(result.status, 500);
      assert.deepEqual(await result.json(), { success: false, error: "No se pudo procesar la consulta. Inténtalo más tarde." });
    }
    assert.equal(logs.length, 3);
    assert.ok(logs.every((args) => JSON.stringify(args) === JSON.stringify(["POST /api/chat: fallo al procesar la consulta."])));
  } finally {
    logger.mock.restore();
  }
  console.log("OK: runtime Node.js, JSON inválido, estructura, roles, vacíos, límites, último user, orden, fuentes, contexto vacío y errores saneados. Sin servicios reales.");
}

async function live() {
  const question = "¿Qué significa RAG? Responde en una o dos frases y cita los fragmentos.";
  // Una única solicitud HTTP; sin sondeos, redirecciones ni reintentos.
  const response = await fetch("http://127.0.0.1:3047/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: question }] }),
    redirect: "error", signal: AbortSignal.timeout(180_000),
  });
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  const data = payload.data as ChatResponse;
  assert.ok(data.answer.trim().length > 0 && data.sources.length > 0);
  const allowed = new Set(data.sources.map((source) => `${encodeURIComponent(source.source)}#${source.chunkIndex}`));
  const citations = [...data.answer.matchAll(/\[([^\]\n]+)\]/g)].map((match) => match[1]);
  assert.ok(citations.length > 0 && citations.every((citation) => allowed.has(citation)));
  console.log(JSON.stringify({ status: response.status, question, ...data, citations }, null, 2));
  console.log("OK: una solicitud HTTP real. Las referencias existentes no prueban por sí solas fidelidad.");
}

(process.argv.includes("--live") ? live() : simulated()).catch(() => {
  console.error("Prueba del endpoint fallida; revisar las aserciones y el estado del servidor sin imprimir secretos.");
  process.exitCode = 1;
});
