import "server-only";
import type { ApiResponse, ChatMessage, ChatResponse } from "@/types";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 4000;

function json(body: ApiResponse<ChatResponse>, status: number): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** La dependencia explícita permite probar el límite HTTP sin servicios externos. */
export function createChatPost(answerQuestion: (messages: ChatMessage[]) => Promise<ChatResponse>) {
  return async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "El cuerpo debe ser JSON válido." }, 400);
    }
    if (!body || typeof body !== "object" || !("messages" in body) ||
        !Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
      return json({ success: false, error: "Envía entre 1 y 20 mensajes en messages." }, 400);
    }

    const messages: ChatMessage[] = [];
    for (const message of body.messages) {
      if (!message || typeof message !== "object" ||
          (message.role !== "user" && message.role !== "assistant") ||
          typeof message.content !== "string" || message.content.trim().length === 0 ||
          message.content.length > MAX_CONTENT_LENGTH) {
        return json({ success: false, error: "Cada mensaje debe tener rol user o assistant y texto no vacío de hasta 4000 caracteres." }, 400);
      }
      // Conservar orden y texto; no pasar propiedades adicionales al pipeline.
      messages.push({ role: message.role, content: message.content });
    }
    if (messages[messages.length - 1].role !== "user") {
      return json({ success: false, error: "El último mensaje debe ser del usuario." }, 400);
    }

    try {
      return json({ success: true, data: await answerQuestion(messages) }, 200);
    } catch {
      // No registrar mensajes, objetos Error, causas, SQL ni configuración.
      console.error("POST /api/chat: fallo al procesar la consulta.");
      return json({ success: false, error: "No se pudo procesar la consulta. Inténtalo más tarde." }, 500);
    }
  };
}
