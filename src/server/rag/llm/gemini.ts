import "server-only";
import { config } from "../../config";
import type { LlmClient, LlmRequest } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasBlockedRating(ratings: unknown): boolean {
  return Array.isArray(ratings) && ratings.some((rating) => isRecord(rating) && rating.blocked === true);
}

const blockedFinishReasons = new Set([
  "SAFETY", "RECITATION", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII", "IMAGE_SAFETY",
]);

/** GenerateContent de texto, sin streaming ni reintentos. Integración real aún no verificada. */
export const geminiClient: LlmClient = {
  async generate(request: LlmRequest): Promise<string> {
    const apiKey = config.llm.gemini.apiKey.trim();
    if (!apiKey) throw new Error("Gemini: falta configurar GEMINI_API_KEY.");
    const model = config.llm.gemini.model.trim().replace(/^models\//, "");
    if (!model) throw new Error("Gemini: falta configurar GEMINI_MODEL.");
    const signal = AbortSignal.timeout(30_000);
    let response: Response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: request.system }] },
          contents: request.messages.map(({ role, content }) => ({
            role: role === "assistant" ? "model" : "user",
            parts: [{ text: content }],
          })),
          generationConfig: { candidateCount: 1, maxOutputTokens: 1024 },
        }),
        signal,
        cache: "no-store",
        redirect: "error",
      });
    } catch {
      if (signal.aborted) throw new Error("Gemini: tiempo de espera agotado (30 segundos).");
      throw new Error("Gemini: no se pudo conectar con el servicio.");
    }
    if (!response.ok) {
      const detail = response.status === 401 ? "Revisa la clave configurada."
        : response.status === 403 ? "Acceso al modelo o servicio denegado."
        : response.status === 404 ? "Modelo no disponible para esta configuración o cuenta."
        : response.status === 429 ? "Límite de solicitudes o tokens alcanzado; inténtalo más tarde."
        : response.status >= 500 ? "El servicio no está disponible temporalmente."
        : "La solicitud fue rechazada.";
      // Nunca propagar el cuerpo, statusText ni causas de red que puedan incluir secretos.
      throw new Error(`Gemini: error HTTP ${response.status}. ${detail}`);
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      if (signal.aborted) throw new Error("Gemini: tiempo de espera agotado (30 segundos).");
      throw new Error("Gemini: respuesta JSON inválida o incompleta.");
    }
    const feedback = isRecord(payload) ? payload.promptFeedback : undefined;
    if (isRecord(feedback) && ((feedback.blockReason && feedback.blockReason !== "BLOCK_REASON_UNSPECIFIED") ||
        hasBlockedRating(feedback.safetyRatings))) {
      throw new Error("Gemini: la solicitud fue bloqueada por el proveedor.");
    }
    const candidate = isRecord(payload) && Array.isArray(payload.candidates) ? payload.candidates[0] : undefined;
    if (isRecord(candidate)) {
      if (hasBlockedRating(candidate.safetyRatings) ||
          (typeof candidate.finishReason === "string" && blockedFinishReasons.has(candidate.finishReason))) {
        throw new Error("Gemini: la respuesta fue bloqueada por el proveedor.");
      }
      if (candidate.finishReason === "MAX_TOKENS") {
        throw new Error("Gemini: respuesta incompleta por límite de tokens.");
      }
      if (candidate.finishReason && candidate.finishReason !== "STOP") {
        throw new Error("Gemini: la generación no terminó correctamente.");
      }
    }
    const content = isRecord(candidate) ? candidate.content : undefined;
    const parts = isRecord(content) && Array.isArray(content.parts) ? content.parts : [];
    const text = parts.filter((part) => isRecord(part) && part.thought !== true && typeof part.text === "string")
      .map((part) => part.text).join("").trim();
    if (!text) throw new Error("Gemini: respuesta vacía o sin contenido de texto.");
    return text;
  },
};
