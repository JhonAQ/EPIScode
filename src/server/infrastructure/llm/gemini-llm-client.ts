import type { LlmClient, LlmRequest } from "@/server/application/ports/llm-client";
import { config } from "../config/env";

/**
 * Adaptador de `LlmClient` para Gemini. Clave en https://aistudio.google.com/apikey
 *
 * TODO (Integrante C): implementar `generate`.
 *
 * Pistas:
 *  - Variables disponibles en `config.llm.gemini`: apiKey, model.
 *  - Endpoint (verifiquen en https://ai.google.dev/gemini-api/docs):
 *      POST https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent
 *      Header: x-goog-api-key: <GEMINI_API_KEY>
 *      Body:   { systemInstruction: { parts: [{ text }] },
 *                contents: [{ role: "user" | "model", parts: [{ text }] }] }
 *      Texto de la respuesta: candidates[0].content.parts[0].text
 *  - Ojo: Gemini llama "model" al rol que nosotros llamamos "assistant".
 *
 * Reto: streaming con `:streamGenerateContent?alt=sse`.
 */
export class GeminiLlmClient implements LlmClient {
  async generate(request: LlmRequest): Promise<string> {
    void config;
    void request;
    throw new Error("TODO: implementar GeminiLlmClient.generate()");
  }
}
