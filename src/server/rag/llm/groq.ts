import { config } from "@/server/config";
import type { LlmClient } from "./types";
import { postJson } from "../http";
export const groqClient: LlmClient = {
  async generate(request) {
    const data = await postJson("https://api.groq.com/openai/v1/chat/completions", { Authorization: "Bearer " + config.llm.groq.apiKey }, {
      model: config.llm.groq.model, messages: [{ role: "system", content: request.system }, ...request.messages], temperature: 0.2, max_tokens: 1024,
    }) as { choices?: { message?: { content?: string } }[] };
    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("Groq no devolvió texto");
    return answer;
  },
};
