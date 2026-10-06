import type { LlmClient, LlmRequest } from "./types";

/**
 * TODO (Integrante C): cliente de Gemini. Clave en https://aistudio.google.com/apikey
 *
 * Pistas:
 *  - Variables disponibles en `config.llm.gemini` (src/server/config.ts): apiKey, model.
 *  - Endpoint (verifiquen en https://ai.google.dev/gemini-api/docs):
 *      POST https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent
 *      Header: x-goog-api-key: <GEMINI_API_KEY>
 *      Body:   { systemInstruction: { parts: [{ text }] },
 *                contents: [{ role: "user" | "model", parts: [{ text }] }] }
 *      Texto de la respuesta: candidates[0].content.parts[0].text
 *  - Ojo: Gemini llama "model" al rol que nosotros llamamos "assistant".
 *
 * Reto: implementar streaming con el método `:streamGenerateContent?alt=sse`.
 */
export const geminiClient: LlmClient = {
  async generate(request: LlmRequest) {
    void request;
    throw new Error("TODO: implementar geminiClient.generate() en src/server/rag/llm/gemini.ts");
  },
};
