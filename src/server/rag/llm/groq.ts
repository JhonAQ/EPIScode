import type { LlmClient, LlmRequest } from "./types";

/**
 * TODO (Integrante C): cliente de Groq. Clave en https://console.groq.com/keys
 *
 * Pistas:
 *  - Variables disponibles en `config.llm.groq` (src/server/config.ts): apiKey, model.
 *  - Groq usa una API compatible con OpenAI (verifiquen en https://console.groq.com/docs):
 *      POST https://api.groq.com/openai/v1/chat/completions
 *      Header: Authorization: Bearer <GROQ_API_KEY>
 *      Body:   { model, messages: [{ role: "system" | "user" | "assistant", content }] }
 *      Texto de la respuesta: choices[0].message.content
 *  - El prompt de sistema va como primer mensaje con role "system".
 *
 * Reto: implementar streaming con `stream: true` (llega como Server-Sent Events).
 */
export const groqClient: LlmClient = {
  async generate(request: LlmRequest) {
    void request;
    throw new Error("TODO: implementar groqClient.generate() en src/server/rag/llm/groq.ts");
  },
};
