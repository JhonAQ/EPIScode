import type { LlmClient, LlmRequest } from "./types";
import { config } from "../../config";

// Representa un mensaje enviado a Groq, con uno de los roles admitidos por su API.
interface GroqRequestMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Representa el mensaje de texto que Groq devuelve en una opción de respuesta.
interface GroqResponseMessage {
  content?: string | null;
}

// Representa una opción de respuesta que puede incluir un mensaje generado.
interface GroqChoice {
  message?: GroqResponseMessage;
}

// Representa la respuesta JSON de completions de chat de Groq.
interface GroqResponse {
  choices?: GroqChoice[];
}

/**
 * TODO (Integrante C): cliente de Groq. Clave en https://console.groq.com/keys
 *
 * Pistas:
 *  - Variables disponibles en `config.llm.groq` (src/server/config.ts): apiKey, model.
 *  - Groq usa una API compatible con OpenAI (verifiquen en https://console.groq.com/docs):
 *      POST https://api.groq.com/openai/v1/chat/completions
 *      Header: Authorization: Bearer <GROQ_API_KEY>
 *      Body:   { model, messages: [{ role: "system" | "user" | "assistant", content }] }
 *      Texto de la respuesta: choices[0].message.content
 *  - El prompt de sistema va como primer mensaje con role "system".
 *
 * Reto: implementar streaming con `stream: true` (llega como Server-Sent Events).
 */
export const groqClient: LlmClient = {
  async generate(request: LlmRequest) {
    // El sistema inicia la lista; el historial se agrega después, en el orden recibido.
    const messages: GroqRequestMessage[] = [];
    messages.push({
      role: "system",
      content: request.system,
    });

    // Conservamos los roles user y assistant del contrato del proyecto.
    for (const message of request.messages) {
      let role: "user" | "assistant";

      if (message.role === "assistant") {
        role = "assistant";
      } else {
        role = "user";
      }

      messages.push({
        role,
        content: message.content,
      });
    }

    // Enviamos el modelo y la clave configurados para el proyecto.
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.llm.groq.apiKey}`,
      },
      body: JSON.stringify({
        model: config.llm.groq.model,
        messages,
      }),
    });

    // No interpretamos una respuesta HTTP fallida como si fuera una respuesta del modelo.
    if (!response.ok) {
      throw new Error(`Groq devolvió un error HTTP ${response.status}.`);
    }

    const result: GroqResponse = await response.json();

    // Comprobamos que Groq haya devuelto al menos una opción.
    if (!result.choices) {
      throw new Error("Groq no devolvió opciones en su respuesta.");
    }

    const firstChoice = result.choices[0];
    if (!firstChoice) {
      throw new Error("Groq devolvió una lista de opciones vacía.");
    }

    // La primera opción debe contener texto para satisfacer el contrato del cliente.
    const responseMessage = firstChoice.message;
    if (!responseMessage) {
      throw new Error("La primera opción de Groq no contiene un mensaje.");
    }

    const responseContent = responseMessage.content;
    if (typeof responseContent !== "string") {
      throw new Error("La primera opción de Groq no contiene texto.");
    }

    // Quitamos espacios externos y rechazamos una respuesta que quede vacía.
    const text = responseContent.trim();
    if (!text) {
      throw new Error("Groq no devolvió una respuesta de texto válida.");
    }

    return text;
  },
};
