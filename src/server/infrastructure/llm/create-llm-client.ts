import type { LlmClient } from "@/server/application/ports/llm-client";
import { config } from "../config/env";
import { GeminiLlmClient } from "./gemini-llm-client";
import { GroqLlmClient } from "./groq-llm-client";

/** Elige el proveedor según LLM_PROVIDER. Agregar otro = un adaptador nuevo + un caso aquí. */
export function createLlmClient(provider: string = config.llm.provider): LlmClient {
  switch (provider) {
    case "gemini":
      return new GeminiLlmClient();
    case "groq":
      return new GroqLlmClient();
    default:
      throw new Error(`LLM_PROVIDER inválido: "${provider}". Usa "gemini" o "groq".`);
  }
}
