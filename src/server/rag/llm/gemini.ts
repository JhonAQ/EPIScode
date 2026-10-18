import { config } from "@/server/config";
import { LlmError, type LlmClient, type LlmRequest } from "./types";

/**
 * Cliente de Gemini (Google AI Studio).
 * Traduce LlmRequest al formato de Gemini y devuelve el texto de la respuesta.
 */
export const geminiClient: LlmClient = {
  async generate({ system, messages }: LlmRequest): Promise<string> {
    const model = config.llm.gemini.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.llm.gemini.apiKey,
      },
      body: JSON.stringify({
        // Instrucciones del sistema: rol + reglas + contexto recuperado.
        systemInstruction: { parts: [{ text: system }] },
        // Historial. OJO: Gemini llama "model" al rol que nosotros llamamos "assistant".
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
      }),
    });

    // No devolvemos el texto crudo del error: solo el status decide el fallback.
    if (!response.ok) {
      throw new LlmError(`Gemini respondió ${response.status}`, response.status);
    }

    const data = await response.json();
    // La respuesta viene anidada: candidates[0].content.parts[0].text
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new LlmError("Gemini devolvió una respuesta sin texto", 502);
    }
    return text;
  },
};
