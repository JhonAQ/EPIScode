import type { LlmClient } from "./types";

export type { LlmClient, LlmRequest } from "./types";

/**
 * TODO (Integrante C): devolver el cliente según `config.llm.provider` (LLM_PROVIDER).
 * Agregar otro proveedor = un archivo nuevo + un caso aquí. Lancen un error claro si el valor es inválido.
 */
export function getLlm(): LlmClient {
  throw new Error("TODO: implementar getLlm() en src/server/rag/llm/index.ts");
}
