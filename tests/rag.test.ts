import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkText } from "../src/server/rag/chunker";
import { embedTexts } from "../src/server/rag/embeddings";
import { POST } from "../src/app/api/chat/route";
import { buildChatRequest, MAX_CHAT_BODY_LENGTH, MAX_CHAT_MESSAGES } from "../src/lib/chat-history";
import type { ChatMessage } from "../src/types";
import { getPool } from "../src/server/db";
import { saveCorpus, saveChunks, searchSimilar } from "../src/server/rag/store";
import { geminiClient } from "../src/server/rag/llm/gemini";
import { groqClient } from "../src/server/rag/llm/groq";
test("chunking conserva caracteres y solapamiento", () => {
  const input = "abcdefghij".repeat(31);
  const chunks = chunkText(input, { size: 80, overlap: 15 });
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every(c => c.content.length <= 80));
  let reconstructed = chunks[0].content;
  for (let i = 1; i < chunks.length; i++) {
    assert.equal(chunks[i - 1].content.slice(-15), chunks[i].content.slice(0, 15));
    reconstructed += chunks[i].content.slice(15);
  }
  assert.equal(reconstructed, input);
  assert.deepEqual(chunkText("  "), []);
  assert.throws(() => chunkText(input, { size: 80, overlap: 80 }));
});
test("chunking respeta párrafos cuando hay un corte razonable", () => {
  const text = "a".repeat(60) + "\n\n" + "b".repeat(60);
  assert.equal(chunkText(text, { size: 80, overlap: 10 })[0].content, "a".repeat(60));
});
test("embeddings procesa lotes y rechaza dimensiones incorrectas", async () => {
  const previous = globalThis.fetch;
  process.env.HF_API_TOKEN = "test";
  process.env.EMBEDDING_PROVIDER = "huggingface";
  let calls = 0;
  globalThis.fetch = async (_url, init) => {
    calls++;
    const body = JSON.parse(String(init?.body));
    return Response.json(body.inputs.map(() => Array(384).fill(0.1)));
  };
  try {
    assert.equal((await embedTexts(Array(9).fill("texto"))).length, 9);
    assert.equal(calls, 2);
    globalThis.fetch = async () => Response.json([[1, 2]]);
    await assert.rejects(embedTexts(["texto"]), /Embedding/);
  } finally { globalThis.fetch = previous; delete process.env.HF_API_TOKEN; delete process.env.EMBEDDING_PROVIDER; }
});
test("endpoint rechaza JSON y conversaciones inválidas antes de llamar servicios", async () => {
  for (const body of ['{', '{}', '{"messages":[]}', '{"messages":[{"role":"assistant","content":"x"}]}', JSON.stringify({ messages: [{ role: "user", content: "x".repeat(1001) }] })]) {
    const response = await POST(new Request("http://localhost/api/chat", { method: "POST", body }));
    assert.equal(response.status, 400);
  }
});

test("historial largo conserva la pregunta y elimina pares completos hasta caber", () => {
  const messages: ChatMessage[] = [];
  for (let turn = 0; turn < 15; turn++) {
    messages.push({ role: "user", content: "pregunta" });
    messages.push({ role: "assistant", content: '"\\'.repeat(5000) });
  }
  messages.push({ role: "user", content: "pregunta actual" });
  const request = buildChatRequest(messages);
  assert.ok(JSON.stringify(request).length <= MAX_CHAT_BODY_LENGTH);
  assert.ok(request.messages.length <= MAX_CHAT_MESSAGES);
  assert.equal(request.messages.length % 2, 1);
  assert.deepEqual(request.messages.at(-1), messages.at(-1));
  assert.ok(request.messages.every((message, index) => message.role === (index % 2 === 0 ? "user" : "assistant")));
  assert.equal(messages.length, 31);
});

test("corpus elimina documentos ausentes y revierte todos los cambios si falla una inserción", async context => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL ??= "postgresql://localhost/review_test";
  const pool = getPool();
  const statements: string[] = [];
  let failInsert = false;
  const client = {
    async query(sql: string, parameters?: unknown[]) {
      statements.push(sql);
      if (sql.includes("ANY")) assert.deepEqual(parameters, [["actual.md"]]);
      if (failInsert && sql.startsWith("INSERT")) throw new Error("Inserción fallida");
      return { rows: [] };
    },
    release: context.mock.fn(),
  };
  context.mock.method(pool, "connect", async () => client);
  const document = { source: "actual.md", chunks: [{ index: 0, content: "texto" }], embeddings: [Array(384).fill(0.1)] };
  try {
    await saveCorpus([document]);
    assert.ok(statements.some(sql => sql.startsWith("DELETE") && sql.includes("ANY")));
    assert.equal(statements.at(-1), "COMMIT");
    statements.length = 0;
    failInsert = true;
    await assert.rejects(saveCorpus([document]), /Inserción fallida/);
    assert.equal(statements.at(-1), "ROLLBACK");
    assert.ok(!statements.includes("COMMIT"));
    assert.equal(client.release.mock.callCount(), 2);
    statements.length = 0;
    failInsert = false;
    await saveChunks(document.source, document.chunks, document.embeddings);
    assert.ok(!statements.some(sql => sql.includes("ANY")));
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  }
});

test("retrieval aplica top-k y umbral configurados", async context => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousThreshold = process.env.RAG_MIN_SCORE;
  process.env.DATABASE_URL ??= "postgresql://localhost/review_test";
  process.env.RAG_MIN_SCORE = "0.25";
  const relevant = { source: "actual.md", chunkIndex: 0, content: "overlap", score: 0.267 };
  context.mock.method(getPool(), "query", async (_sql: string, parameters: unknown[]) => {
    assert.equal(parameters[1], 5);
    return { rows: [relevant, { ...relevant, score: 0.24 }] };
  });
  try {
    assert.deepEqual(await searchSimilar(Array(384).fill(0.1)), [relevant]);
    await assert.rejects(searchSimilar(Array(384).fill(0.1), 0), /topK/);
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
    if (previousThreshold === undefined) delete process.env.RAG_MIN_SCORE;
    else process.env.RAG_MIN_SCORE = previousThreshold;
  }
});

test("clientes LLM envían contexto, convierten roles y rechazan respuestas vacías", async context => {
  const previousGeminiKey = process.env.GEMINI_API_KEY;
  const previousGroqKey = process.env.GROQ_API_KEY;
  process.env.GEMINI_API_KEY = "test";
  process.env.GROQ_API_KEY = "test";
  const request = { system: "Contexto de prueba", messages: [{ role: "user" as const, content: "Pregunta" }, { role: "assistant" as const, content: "Anterior" }, { role: "user" as const, content: "Otra" }] };
  let empty = false;
  context.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    if (url.includes("googleapis")) {
      assert.equal(body.systemInstruction.parts[0].text, request.system);
      assert.equal(body.contents[1].role, "model");
      return Response.json({ candidates: [{ content: { parts: [{ text: "interno", thought: true }, { text: empty ? "" : "Respuesta [1]" }] } }] });
    }
    assert.equal(body.messages[0].role, "system");
    assert.equal(body.messages[0].content, request.system);
    return Response.json({ choices: [{ message: { content: empty ? "" : "Respuesta [1]" } }] });
  });
  try {
    assert.equal(await geminiClient.generate(request), "Respuesta [1]");
    assert.equal(await groqClient.generate(request), "Respuesta [1]");
    empty = true;
    await assert.rejects(geminiClient.generate(request), /no devolvió texto/);
    await assert.rejects(groqClient.generate(request), /no devolvió texto/);
  } finally {
    if (previousGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousGeminiKey;
    if (previousGroqKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = previousGroqKey;
  }
});

test("cuota del proveedor devuelve un error explicativo sin repetir la llamada", async context => {
  const names = ["DATABASE_URL", "EMBEDDING_PROVIDER", "HF_API_TOKEN", "GEMINI_API_KEY"] as const;
  const previous = names.map(name => process.env[name]);
  process.env.DATABASE_URL ??= "postgresql://localhost/review_test";
  process.env.EMBEDDING_PROVIDER = "huggingface";
  process.env.HF_API_TOKEN = "test";
  process.env.GEMINI_API_KEY = "test";
  let providerCalls = 0;
  context.mock.method(getPool(), "query", async () => ({ rows: [{ source: "ejemplo.md", chunkIndex: 0, content: "RAG", score: 0.9 }] }));
  context.mock.method(globalThis, "fetch", async (url: string) => {
    if (url.includes("huggingface")) return Response.json([Array(384).fill(0.1)]);
    providerCalls++;
    return Response.json({ error: "cuota" }, { status: 429, headers: { "Retry-After": "30" } });
  });
  context.mock.method(console, "error", () => {});
  try {
    const response = await POST(new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ messages: [{ role: "user", content: "¿Qué es RAG?" }] }) }));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("Retry-After"), "30");
    assert.match((await response.json()).error, /cuota o límite/);
    assert.equal(providerCalls, 1);
  } finally {
    names.forEach((name, index) => {
      if (previous[index] === undefined) delete process.env[name];
      else process.env[name] = previous[index];
    });
  }
});
