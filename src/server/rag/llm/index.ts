import { config } from "@/server/config";
import { geminiClient } from "./gemini";
import { groqClient } from "./groq";
import { LlmError, type LlmClient } from "./types";

export type { LlmClient, LlmRequest } from "./types";
export { LlmError } from "./types";

/** Status HTTP que indican cuota agotada, key rechazada o servidor caído. */
const FALLBACK_STATUS = new Set([429, 403, 500, 502, 503]);

/**
 * Envuelve un cliente para que, si falla por cuota o servidor caído,
 * use el otro proveedor automáticamente. Así Gemini cae a Groq sin que
 * el pipeline se entere. Otros errores se propagan tal cual.
 */
function withFallback(primary: LlmClient, secondary: LlmClient): LlmClient {
  return {
    async generate(request) {
      try {
        return await primary.generate(request);
      } catch (error) {
        if (error instanceof LlmError && FALLBACK_STATUS.has(error.status)) {
          console.warn(`[llm] ${error.message}: usando el proveedor alternativo`);
          return secondary.generate(request);
        }
        throw error;
      }
    },
  };
}

/**
 * Devuelve el cliente según LLM_PROVIDER, con el otro proveedor como respaldo.
 *   gemini (principal) -> groq (respaldo)
 *   groq   (principal) -> gemini (respaldo)
 */
export function getLlm(): LlmClient {
  if (config.llm.provider === "groq") {
    return withFallback(groqClient, geminiClient);
  }
  return withFallback(geminiClient, groqClient);
}
