import { config } from "@/server/config";
import type { LlmClient } from "./types";
import { postJson } from "../http";
export const geminiClient: LlmClient = {
  async generate(request) {
    const data = await postJson("https://generativelanguage.googleapis.com/v1beta/models/" + config.llm.gemini.model + ":generateContent", { "x-goog-api-key": config.llm.gemini.apiKey }, {
      systemInstruction: { parts: [{ text: request.system }] },
      contents: request.messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
    }) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
    const answer = data.candidates?.[0]?.content?.parts?.filter(p => !p.thought).map(p => p.text ?? "").join("").trim();
    if (!answer) throw new Error("Gemini no devolvió texto");
    return answer;
  },
};
