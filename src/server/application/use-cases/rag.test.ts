import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LlmClient, LlmRequest } from "@/server/application/ports/llm-client";
import { InvalidConversationError } from "@/server/domain/errors";
import { chunkText } from "@/server/domain/services/chunker";
import { FakeEmbeddingProvider } from "@/server/infrastructure/in-memory/fake-embedding-provider";
import { InMemoryVectorStore } from "@/server/infrastructure/in-memory/in-memory-vector-store";
import { AnswerQuestion, NO_CONTEXT_ANSWER } from "./answer-question";
import { IngestDocument } from "./ingest-document";

class SpyLlm implements LlmClient {
  requests: LlmRequest[] = [];
  async generate(request: LlmRequest) {
    this.requests.push(request);
    return "respuesta simulada";
  }
}

function setup() {
  const embeddings = new FakeEmbeddingProvider();
  const store = new InMemoryVectorStore();
  const llm = new SpyLlm();
  return {
    llm,
    ingest: new IngestDocument(embeddings, store, { size: 60, overlap: 10 }),
    answer: new AnswerQuestion(embeddings, store, llm),
  };
}

describe("chunkText", () => {
  it("divide con solapamiento y numera los fragmentos", () => {
    const chunks = chunkText("a".repeat(250), { size: 100, overlap: 20 });
    assert.deepEqual(chunks.map((c) => c.index), [0, 1, 2]);
    assert.ok(chunks.every((c) => c.content.length <= 100));
  });

  it("rechaza un overlap inválido", () => {
    assert.throws(() => chunkText("hola", { size: 10, overlap: 10 }), RangeError);
  });
});

describe("IngestDocument + AnswerQuestion", () => {
  it("recupera el fragmento relevante y se lo pasa al LLM", async () => {
    const { ingest, answer, llm } = setup();
    const saved = await ingest.execute({
      source: "doc.md",
      text: "El pgvector permite guardar embeddings en Postgres. Las bananas son amarillas y dulces.",
    });
    assert.ok(saved > 0);

    const result = await answer.execute([{ role: "user", content: "Qué es pgvector en Postgres?" }]);

    assert.equal(result.answer, "respuesta simulada");
    assert.ok(result.sources.length > 0);
    assert.match(llm.requests[0].system, /pgvector/);
  });

  it("no llama al LLM si no hay contexto relevante", async () => {
    const { answer, llm } = setup();
    const result = await answer.execute([{ role: "user", content: "hola" }]);
    assert.equal(result.answer, NO_CONTEXT_ANSWER);
    assert.equal(llm.requests.length, 0);
  });

  it("rechaza conversaciones que no terminan con el usuario", async () => {
    const { answer } = setup();
    await assert.rejects(
      answer.execute([{ role: "assistant", content: "hola" }]),
      InvalidConversationError,
    );
  });
});
