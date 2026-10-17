import { answerQuestion } from "@/server/rag/pipeline";
import type { ChatMessage } from "@/types";
import { MAX_CHAT_BODY_LENGTH, MAX_CHAT_MESSAGES } from "@/lib/chat-history";
import { ExternalServiceError } from "@/server/rag/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_CHAT_BODY_LENGTH) return Response.json({ success: false, error: "Solicitud demasiado grande." }, { status: 413 });
    body = JSON.parse(text);
  } catch { return Response.json({ success: false, error: "JSON inválido." }, { status: 400 }); }
  const messages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(messages) || !messages.length || messages.length > MAX_CHAT_MESSAGES ||
      !messages.every((m, i) => m && m.role === (i % 2 === 0 ? "user" : "assistant") && typeof m.content === "string" && m.content.trim().length > 0 && m.content.length <= (m.role === "user" ? 1000 : 12000)) || messages.at(-1).role !== "user") {
    return Response.json({ success: false, error: "Envía hasta 19 mensajes alternados; cada pregunta admite 1000 caracteres." }, { status: 400 });
  }
  try {
    const data = await answerQuestion(messages.map((m: ChatMessage) => ({ role: m.role, content: m.content.trim() })));
    return Response.json({ success: true, data });
  } catch (error) {
    if (error instanceof ExternalServiceError) {
      console.error("Error del proveedor del chat:", { status: error.status });
      if (error.status === 429) {
        const headers: Record<string, string> = {};
        if (error.retryAfterSeconds !== undefined) headers["Retry-After"] = String(error.retryAfterSeconds);
        return Response.json({ success: false, error: "El proveedor de IA alcanzó su cuota o límite de solicitudes. Espera antes de reintentar y revisa la cuota del modelo en tu cuenta del proveedor." }, { status: 503, headers });
      }
    }
    console.error("Error del chat:", error instanceof Error ? error.name : "Error");
    return Response.json({ success: false, error: "No se pudo generar la respuesta. Revisa Docker, la ingesta y las claves del servidor." }, { status: 500 });
  }
}
