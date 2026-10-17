import { answerQuestion } from "@/server/rag/pipeline";
import type { ChatMessage } from "@/types";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_USER_MESSAGE_LENGTH = 1000;
const MAX_ASSISTANT_MESSAGE_LENGTH = 8000;
const MAX_TOTAL_LENGTH = 20000;

// Comprueba la forma y el tamaño del cuerpo antes de llamar al pipeline.
function isValidChatBody(body: unknown): body is { messages: ChatMessage[] } {
  // El cuerpo debe ser un objeto con una lista no vacía y acotada de mensajes.
  if (typeof body !== "object" || body === null || !("messages" in body)) {
    return false;
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return false;
  }

  let totalLength = 0;
  for (const message of messages) {
    // Cada elemento debe ser un objeto con un rol permitido y contenido de texto no vacío.
    if (typeof message !== "object" || message === null) {
      return false;
    }

    if (message.role !== "user" && message.role !== "assistant") {
      return false;
    }

    if (typeof message.content !== "string" || message.content.trim().length === 0) {
      return false;
    }

    // Se aplican límites distintos por rol y un límite conjunto para controlar el tamaño enviado.
    if (message.role === "user" && message.content.length > MAX_USER_MESSAGE_LENGTH) {
      return false;
    }

    if (message.role === "assistant" && message.content.length > MAX_ASSISTANT_MESSAGE_LENGTH) {
      return false;
    }

    totalLength += message.content.length;
    if (totalLength > MAX_TOTAL_LENGTH) {
      return false;
    }
  }

  // La última intervención debe ser del usuario porque representa la pregunta por responder.
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") {
    return false;
  }

  return true;
}

/**
 * TODO (Integrante D): endpoint del chat.
 *
 * Contrato:
 *   POST /api/chat
 *   body:      ChatRequest  { messages: ChatMessage[] }          (tipos en src/types/index.ts)
 *   respuesta: ApiResponse<ChatResponse>  { success, data?: { answer, sources }, error? }
 *
 * Qué debe hacer:
 *  - Leer y validar el body: mensajes no vacíos, roles válidos, longitud máxima por mensaje
 *    y cantidad máxima de mensajes (acotan el gasto de la cuota gratuita), y que el último sea del usuario.
 *    Respuesta 400 si es inválido.
 *  - Llamar a answerQuestion(messages) de "@/server/rag/pipeline".
 *  - Si algo falla: loguear en el servidor y responder 500 con un mensaje GENÉRICO
 *    (nunca devolver el error interno: puede contener detalles de keys o SQL).
 *
 * Reto: streaming (ReadableStream / SSE) y rate limiting por IP.
 *
 * Referencia de Route Handlers en esta versión de Next.js:
 *   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md
 */
export async function POST(request: Request) {
  let body: unknown;

  // Lee el JSON y separa los errores de formato de los errores del pipeline.
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "El cuerpo de la solicitud no es válido." }, { status: 400 });
  }

  if (!isValidChatBody(body)) {
    return Response.json({ success: false, error: "El cuerpo de la solicitud no es válido." }, { status: 400 });
  }

  // Normaliza los mensajes para descartar propiedades adicionales enviadas por la interfaz.
  const messages: ChatMessage[] = [];
  for (const message of body.messages) {
    messages.push({ role: message.role, content: message.content });
  }

  // Ejecuta la consulta y evita exponer detalles internos en la respuesta HTTP.
  try {
    const result = await answerQuestion(messages);
    return Response.json({
      success: true,
      data: { answer: result.answer, sources: result.sources },
    });
  } catch {
    console.error("Falló el procesamiento de la solicitud de chat.");
    return Response.json({ success: false, error: "No se pudo procesar la solicitud de chat." }, { status: 500 });
  }
}
