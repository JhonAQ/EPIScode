import { config } from "@/server/config";
import { LlmError, type LlmClient, type LlmRequest } from "./types";

/**
 * Cliente de Groq (API compatible con OpenAI).
 * El prompt de sistema viaja como primer mensaje con role "system".
 */
export const groqClient: LlmClient = {
  async generate({ system, messages }: LlmRequest): Promise<string> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.llm.groq.apiKey}`,
      },
      body: JSON.stringify({
        model: config.llm.groq.model,
        // El system prompt va primero; luego el historial tal cual.
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    if (!response.ok) {
      throw new LlmError(`Groq respondió ${response.status}`, response.status);
    }

    const data = await response.json();
    // La respuesta viene en choices[0].message.content
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string") {
      throw new LlmError("Groq devolvió una respuesta sin texto", 502);
    }
    return text;
  },
};
