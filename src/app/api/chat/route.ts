import { NextResponse } from "next/server";
import { InvalidConversationError } from "@/server/domain/errors";
import { getAnswerQuestion } from "@/server/composition/container";
import { parseChatRequest } from "@/server/interface/http/chat-request";
import type { ApiResponse, ChatResponse } from "@/types";

/**
 * Adaptador de entrada HTTP: traduce request -> caso de uso -> response. Sin lógica de negocio.
 *
 *   POST /api/chat   body: ChatRequest   respuesta: ApiResponse<ChatResponse>   (tipos en src/types)
 *
 * TODO (Integrante D): retos
 *  - streaming (ReadableStream / SSE)
 *  - rate limiting por IP
 *
 * Referencia de Route Handlers en esta versión de Next.js:
 *   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md
 */
export async function POST(request: Request) {
  let messages;
  try {
    messages = parseChatRequest(await request.json());
  } catch (err) {
    const error = err instanceof InvalidConversationError ? err.message : "JSON inválido.";
    return NextResponse.json<ApiResponse<ChatResponse>>({ success: false, error }, { status: 400 });
  }

  try {
    const data = await getAnswerQuestion().execute(messages);
    return NextResponse.json<ApiResponse<ChatResponse>>({ success: true, data });
  } catch (err) {
    if (err instanceof InvalidConversationError) {
      return NextResponse.json<ApiResponse<ChatResponse>>({ success: false, error: err.message }, { status: 400 });
    }
    // Nunca se devuelve el error interno: puede contener detalles de keys o SQL.
    console.error("[api/chat]", err);
    return NextResponse.json<ApiResponse<ChatResponse>>(
      { success: false, error: "No se pudo procesar la pregunta. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
