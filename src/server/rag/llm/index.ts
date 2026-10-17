import { config } from "@/server/config";
import { geminiClient } from "./gemini";
import { groqClient } from "./groq";
import type { LlmClient } from "./types";
export function getLlm(): LlmClient {
  if (config.llm.provider === "gemini") return geminiClient;
  if (config.llm.provider === "groq") return groqClient;
  throw new Error("LLM_PROVIDER debe ser gemini o groq");
}
