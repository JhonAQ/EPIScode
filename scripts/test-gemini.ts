import assert from "node:assert/strict";
import { mock } from "node:test";
import { config } from "../src/server/config";
import { getLlm } from "../src/server/rag/llm";
import { geminiClient } from "../src/server/rag/llm/gemini";
import { groqClient } from "../src/server/rag/llm/groq";
import type { LlmRequest } from "../src/server/rag/llm/types";

async function main() {
  const oldKey = process.env.GEMINI_API_KEY;
  const mutableProvider = config.llm as { provider: string };
  const oldProvider = mutableProvider.provider;
  const mutableModel = config.llm.gemini as { model: string };
  const oldModel = mutableModel.model;
  const fakeKey = "placeholder-for-tests-only";
  const request: LlmRequest = {
    system: "Responde en español solo con el contexto y cita las fuentes.",
    messages: [
      { role: "user", content: "Primera pregunta" },
      { role: "assistant", content: "Primera respuesta" },
      { role: "user", content: "Pregunta actual" },
    ],
  };
  const snapshot = structuredClone(request);
  // No se carga .env.local. Toda solicitud queda interceptada antes de tocar la red.
  const fetchMock = mock.method(globalThis, "fetch", async () => {
    throw new Error("No debe haber solicitudes reales en esta prueba.");
  });
  const expectError = async (pattern: RegExp) => {
    await assert.rejects(geminiClient.generate(request), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, pattern);
      assert.ok(!error.message.includes(fakeKey), "Los errores no deben revelar datos sensibles");
      assert.equal(error.cause, undefined);
      return true;
    });
  };
  try {
    mutableProvider.provider = "gemini";
    assert.equal(getLlm(), geminiClient);
    mutableProvider.provider = "groq";
    assert.equal(getLlm(), groqClient);
    mutableProvider.provider = "desconocido";
    assert.throws(() => getLlm(), /LLM_PROVIDER desconocido/);

    delete process.env.GEMINI_API_KEY;
    await expectError(/GEMINI_API_KEY/);
    process.env.GEMINI_API_KEY = "  ";
    await expectError(/GEMINI_API_KEY/);
    assert.equal(fetchMock.mock.callCount(), 0);
    process.env.GEMINI_API_KEY = fakeKey;
    mutableModel.model = "models/gemini-2.5-flash";
    fetchMock.mock.mockImplementation(async (url, options) => {
      assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent");
      assert.ok(!String(url).includes(fakeKey), "La clave no debe viajar en la URL");
      assert.equal(options?.method, "POST");
      assert.equal(options?.cache, "no-store");
      assert.equal(options?.redirect, "error");
      const headers = new Headers(options?.headers);
      assert.equal(headers.get("x-goog-api-key"), fakeKey);
      const body = JSON.parse(options?.body as string);
      assert.deepEqual(body.systemInstruction, { parts: [{ text: request.system }] });
      assert.deepEqual(body.contents, [
        { role: "user", parts: [{ text: "Primera pregunta" }] },
        { role: "model", parts: [{ text: "Primera respuesta" }] },
        { role: "user", parts: [{ text: "Pregunta actual" }] },
      ]);
      assert.deepEqual(body.generationConfig, { candidateCount: 1, maxOutputTokens: 1024 });
      return Response.json({ candidates: [
        { finishReason: "STOP", content: { parts: [
          { thought: true, text: "No devolver razonamiento" },
          { text: "  Texto " }, { inlineData: { data: "no devolver" } },
          { text: "final.\nOtra línea.  " },
        ] } },
        { finishReason: "STOP", content: { parts: [{ text: "No mezclar otros candidatos" }] } },
      ] });
    });
    assert.equal(await geminiClient.generate(request), "Texto final.\nOtra línea.");
    assert.deepEqual(request, snapshot);
    fetchMock.mock.mockImplementation(async () => Response.json({
      promptFeedback: { blockReason: "BLOCK_REASON_UNSPECIFIED" },
      candidates: [{ finishReason: "STOP", content: { parts: [{ text: "Respuesta normal" }] } }],
    }));
    assert.equal(await geminiClient.generate(request), "Respuesta normal");

    const beforeMissingModel = fetchMock.mock.callCount();
    mutableModel.model = "  ";
    await expectError(/GEMINI_MODEL/);
    assert.equal(fetchMock.mock.callCount(), beforeMissingModel);
    mutableModel.model = "models/gemini-2.5-flash";

    for (const status of [400, 401, 403, 404, 429, 500, 503]) {
      fetchMock.mock.mockImplementation(async () => new Response(fakeKey, { status, statusText: fakeKey }));
      await expectError(new RegExp(`HTTP ${status}`));
    }
    fetchMock.mock.mockImplementation(async () => { throw new Error(fakeKey); });
    await expectError(/no se pudo conectar/);
    fetchMock.mock.mockImplementation(async () => new Response(fakeKey));
    await expectError(/JSON inválida/);

    for (const reason of ["SAFETY", "OTHER", "BLOCKLIST", "PROHIBITED_CONTENT", fakeKey]) {
      fetchMock.mock.mockImplementation(async () => Response.json({ promptFeedback: { blockReason: reason }, candidates: [] }));
      await expectError(/solicitud fue bloqueada/);
    }
    fetchMock.mock.mockImplementation(async () => Response.json({ promptFeedback: { safetyRatings: [{ blocked: true }] } }));
    await expectError(/solicitud fue bloqueada/);
    for (const reason of ["SAFETY", "RECITATION", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII", "IMAGE_SAFETY"]) {
      fetchMock.mock.mockImplementation(async () => Response.json({ candidates: [
        { finishReason: reason, content: { parts: [{ text: fakeKey }] } },
      ] }));
      await expectError(/respuesta fue bloqueada/);
    }
    fetchMock.mock.mockImplementation(async () => Response.json({ candidates: [{ safetyRatings: [{ blocked: true }] }] }));
    await expectError(/respuesta fue bloqueada/);
    fetchMock.mock.mockImplementation(async () => Response.json({ candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [{ text: "incompleto" }] } }] }));
    await expectError(/incompleta por límite de tokens/);
    fetchMock.mock.mockImplementation(async () => Response.json({ candidates: [{ finishReason: fakeKey }] }));
    await expectError(/no terminó correctamente/);

    for (const payload of [null, {}, { candidates: [] }, { candidates: [{}] },
      { candidates: [{ content: { parts: [] } }] },
      { candidates: [{ content: { parts: [null, { text: 42 }, { text: "  " }] } }] },
      { candidates: [{ content: { parts: [{ thought: true, text: "Solo razonamiento" }] } }] }]) {
      fetchMock.mock.mockImplementation(async () => Response.json(payload));
      await expectError(/respuesta vacía/);
    }

    const timeout = mock.method(AbortSignal, "timeout", () => AbortSignal.abort(new DOMException("simulado", "TimeoutError")));
    try {
      fetchMock.mock.mockImplementation(async (_url, options) => { throw options?.signal?.reason; });
      await expectError(/tiempo de espera agotado/);
      fetchMock.mock.mockImplementation(async () => new Response(new ReadableStream({
        start(controller) { controller.error(new DOMException("simulado", "TimeoutError")); },
      })));
      await expectError(/tiempo de espera agotado/);
    } finally {
      timeout.mock.restore();
    }
    console.log("OK: selector, contents, roles, systemInstruction, modelo, texto multiparte, bloqueos, truncado, clave ausente, timeout, red, HTTP y JSON. Llamadas reales: 0.");
  } finally {
    fetchMock.mock.restore();
    mutableProvider.provider = oldProvider;
    mutableModel.model = oldModel;
    if (oldKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = oldKey;
  }
}

main().catch((error: unknown) => {
  console.error("Prueba Gemini fallida:", error instanceof Error ? error.message : "error desconocido");
  process.exitCode = 1;
});
