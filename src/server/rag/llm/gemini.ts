import type { LlmClient, LlmRequest } from "./types";
import { config } from "../../config";

// Representa una parte de texto que se envía en la solicitud a Gemini.
interface GeminiRequestTextPart {
  text: string;
}

// Representa un mensaje del historial en el formato de contenido de Gemini.
interface GeminiRequestContent {
  role: "model" | "user";
  parts: GeminiRequestTextPart[];
}

// Representa una parte individual que Gemini devuelve dentro de una respuesta.
interface GeminiResponsePart {
  text?: string;
  thought?: boolean;
}

// Representa el contenido de un candidato y sus partes de respuesta.
interface GeminiResponseContent {
  parts?: GeminiResponsePart[];
}

// Representa un candidato generado por Gemini, que puede incluir contenido.
interface GeminiCandidate {
  content?: GeminiResponseContent;
}

// Representa el objeto JSON completo recibido de Gemini.
interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

/**
 * TODO (Integrante C): cliente de Gemini. Clave en https://aistudio.google.com/apikey
 *
 * Pistas:
 *  - Variables disponibles en `config.llm.gemini` (src/server/config.ts): apiKey, model.
 *  - Endpoint (verifiquen en https://ai.google.dev/gemini-api/docs):
 *      POST https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent
 *      Header: x-goog-api-key: <GEMINI_API_KEY>
 *      Body:   { systemInstruction: { parts: [{ text }] },
 *                contents: [{ role: "user" | "model", parts: [{ text }] }] }
 *      Texto de la respuesta: candidates[0].content.parts[0].text
 *  - Ojo: Gemini llama "model" al rol que nosotros llamamos "assistant".
 *
 * Reto: implementar streaming con el método `:streamGenerateContent?alt=sse`.
 */

export const geminiClient: LlmClient = {
  async generate(request: LlmRequest) {
    // Preparamos una lista vacía para construir el historial en el mismo orden recibido.
    const contents: GeminiRequestContent[] = [];

    // Convertimos cada mensaje al formato de Gemini sin usar transformaciones compactas.
    for (const message of request.messages) {
      let role: "model" | "user";

      // Gemini representa los mensajes del asistente con el rol "model".
      if (message.role === "assistant") {
        role = "model";
      } else {
        role = "user";
      }

      // Guardamos el rol convertido junto al texto original del mensaje.
      contents.push({
        role,
        parts: [{ text: message.content }],
      });
    }

    // Enviamos la clave en la cabecera y seleccionamos el modelo configurado para este proyecto.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.llm.gemini.model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": config.llm.gemini.apiKey,
        },
        // Gemini recibe las instrucciones del sistema aparte del historial conversacional.
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: request.system }] },
          contents,
        }),
      },
    );

    // No intentamos interpretar respuestas de error HTTP como si fueran texto generado.
    if (!response.ok) {
      throw new Error(`Gemini devolvió un error HTTP ${response.status}.`);
    }

    const result: GeminiResponse = await response.json();

    // Verificamos que Gemini haya devuelto la lista de candidatos.
    if (!result.candidates) {
      throw new Error("Gemini no devolvió candidatos en su respuesta.");
    }

    // Usamos el primer candidato, que contiene la respuesta generada que solicitamos.
    const firstCandidate = result.candidates[0];
    if (!firstCandidate) {
      throw new Error("Gemini devolvió una lista de candidatos vacía.");
    }

    // Comprobamos que el candidato incluya su contenido generado.
    const candidateContent = firstCandidate.content;
    if (!candidateContent) {
      throw new Error("El candidato de Gemini no contiene contenido.");
    }

    // Comprobamos que el contenido incluya las partes de respuesta.
    const responseParts = candidateContent.parts;
    if (!responseParts) {
      throw new Error("El contenido de Gemini no incluye partes de respuesta.");
    }

    const textParts: string[] = [];

    // Conservamos solo texto visible; las partes de pensamiento interno no forman parte de la respuesta.
    for (const part of responseParts) {
      if (!part.thought && typeof part.text === "string") {
        textParts.push(part.text);
      }
    }

    // Unimos las partes de texto en el orden en que llegaron.
    const joinedText = textParts.join("");

    // Eliminamos espacios sobrantes al inicio y al final de la respuesta.
    const text = joinedText.trim();

    // Cumplimos el contrato del cliente: una respuesta vacía no es una respuesta útil.
    if (!text) {
      throw new Error("Gemini no devolvió una respuesta de texto válida.");
    }

    return text;
  },
};
