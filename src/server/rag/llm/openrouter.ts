import type { LlmClient, LlmRequest } from "./types";
import { config } from "../../config";

// Representa un mensaje enviado al endpoint compatible con OpenAI.
interface OpenRouterRequestMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Representa el mensaje generado que OpenRouter incluye en una opción.
interface OpenRouterResponseMessage {
  content?: string;
}

// Representa una opción de generación de OpenRouter.
interface OpenRouterChoice {
  message?: OpenRouterResponseMessage;
}

// Representa la respuesta JSON completa recibida de OpenRouter.
interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
}

export const openrouterClient: LlmClient = {
  async generate(request: LlmRequest) {
    const messages: OpenRouterRequestMessage[] = [];
    messages.push({ role: "system", content: request.system });

    // Conservamos el orden y los roles del historial de la conversación.
    for (const message of request.messages) {
      let role: "user" | "assistant";
      if (message.role === "assistant") {
        role = "assistant";
      } else {
        role = "user";
      }
      messages.push({ role, content: message.content });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.llm.openrouter.apiKey}`,
      },
      body: JSON.stringify({ model: config.llm.openrouter.model, messages }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter devolvió un error HTTP ${response.status}.`);
    }

    const result: OpenRouterResponse = await response.json();
    const choices = result.choices;
    if (!choices || choices.length === 0) {
      throw new Error("OpenRouter no devolvió opciones en su respuesta.");
    }

    const choice = choices[0];
    if (!choice) {
      throw new Error("OpenRouter no devolvió una opción válida.");
    }
    const responseMessage = choice.message;
    if (!responseMessage) {
      throw new Error("OpenRouter no devolvió un mensaje en su respuesta.");
    }

    const responseContent = responseMessage.content;
    if (typeof responseContent !== "string") {
      throw new Error("El mensaje de OpenRouter no contiene texto.");
    }

    const text = responseContent.trim();
    if (!text) {
      throw new Error("OpenRouter no devolvió una respuesta de texto válida.");
    }
    return text;
  },
};
