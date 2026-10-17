import type { LlmClient } from "./types";
import { config } from "../../config";
import { geminiClient } from "./gemini";
import { groqClient } from "./groq";
import { openrouterClient } from "./openrouter";

export type { LlmClient, LlmRequest } from "./types";

/**
 * TODO (Integrante C): devolver el cliente según `config.llm.provider` (LLM_PROVIDER).
 * Agregar otro proveedor = un archivo nuevo + un caso aquí. Lancen un error claro si el valor es inválido.
 */
export function getLlm(): LlmClient {
  // Seleccionamos el cliente configurado sin iniciar solicitudes ni acceder a claves.
  switch (config.llm.provider) {

    case "gemini":
      return geminiClient;

    case "groq":
      return groqClient;

    case "openrouter":
      return openrouterClient;

    default:
      throw new Error(`Proveedor LLM no soportado: ${config.llm.provider}`);
  }
}
