import type { LlmClient, LlmRequest } from "@/server/application/ports/llm-client";
import { config } from "../config/env";

/**
 * Adaptador de `LlmClient` para Groq. Clave en https://console.groq.com/keys
 *
 * TODO (Integrante C): implementar `generate`.
 *
 * Pistas:
 *  - Variables disponibles en `config.llm.groq`: apiKey, model.
 *  - Groq usa una API compatible con OpenAI (verifiquen en https://console.groq.com/docs):
 *      POST https://api.groq.com/openai/v1/chat/completions
 *      Header: Authorization: Bearer <GROQ_API_KEY>
 *      Body:   { model, messages: [{ role: "system" | "user" | "assistant", content }] }
 *      Texto de la respuesta: choices[0].message.content
 *  - El prompt de sistema va como primer mensaje con role "system".
 *
 * Reto: streaming con `stream: true` (Server-Sent Events).
 */
export class GroqLlmClient implements LlmClient {
  async generate(request: LlmRequest): Promise<string> {
    void config;
    void request;
    throw new Error("TODO: implementar GroqLlmClient.generate()");
  }
}
