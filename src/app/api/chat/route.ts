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
  void request;
  throw new Error("TODO: implementar POST /api/chat en src/app/api/chat/route.ts");
}
