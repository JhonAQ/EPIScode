import "server-only";
import { config } from "../../config";
import type { LlmClient, LlmRequest } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Chat completions sin streaming ni reintentos automáticos. Nunca registrar claves ni cuerpos de error. */
export const groqClient: LlmClient = {
  async generate(request: LlmRequest) {
    const apiKey = config.llm.groq.apiKey.trim();
    if (!apiKey) throw new Error("Groq: falta configurar GROQ_API_KEY.");
    const model = config.llm.groq.model;
    const signal = AbortSignal.timeout(30_000);
    let response: Response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: request.system },
            ...request.messages.map(({ role, content }) => ({ role, content })),
          ],
          stream: false,
          max_completion_tokens: 1024,
          ...(model.startsWith("openai/gpt-oss-") ? { reasoning_effort: "low" } : {}),
        }),
        signal,
        cache: "no-store",
        redirect: "error",
      });
    } catch {
      if (signal.aborted) throw new Error("Groq: tiempo de espera agotado (30 segundos).");
      throw new Error("Groq: no se pudo conectar con el servicio.");
    }
    if (!response.ok) {
      const detail = response.status === 401 ? "Revisa la clave configurada."
        : response.status === 403 ? "Acceso al modelo o servicio denegado."
        : response.status === 429 ? "Límite de solicitudes o tokens alcanzado; inténtalo más tarde."
        : response.status >= 500 ? "El servicio no está disponible temporalmente."
        : "La solicitud fue rechazada.";
      // No propagar el cuerpo ni statusText: pueden contener datos sensibles.
      throw new Error(`Groq: error HTTP ${response.status}. ${detail}`);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      if (signal.aborted) throw new Error("Groq: tiempo de espera agotado (30 segundos).");
      throw new Error("Groq: respuesta JSON inválida o incompleta.");
    }
    const choice = isRecord(payload) && Array.isArray(payload.choices) ? payload.choices[0] : undefined;
    const message = isRecord(choice) ? choice.message : undefined;
    const content = isRecord(message) ? message.content : undefined;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error("Groq: respuesta vacía o sin texto.");
    }
    return content.trim();
  },
};
