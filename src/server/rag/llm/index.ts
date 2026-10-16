import "server-only";
import { config } from "../../config";
import { groqClient } from "./groq";
import { geminiClient } from "./gemini";
import type { LlmClient } from "./types";

export type { LlmClient, LlmRequest } from "./types";

/** Selecciona el proveedor configurado sin fallback silencioso. */
export function getLlm(): LlmClient {
  switch (config.llm.provider) {
    case "groq":
      return groqClient;
    case "gemini":
      return geminiClient;
    default:
      throw new Error("LLM_PROVIDER desconocido. Los proveedores implementados son gemini y groq.");
  }
}
