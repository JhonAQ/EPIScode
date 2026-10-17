import type { ChatMessage, ChatResponse, ChatSource } from "@/types";

export interface UiMessage extends ChatMessage { sources?: ChatSource[] }
interface ChatState { messages: UiMessage[]; loading: boolean; error: string | null }

function isChatResponse(value: unknown): value is ChatResponse {
  if (!value || typeof value !== "object" || !("answer" in value) ||
      typeof value.answer !== "string" || !value.answer.trim() || !("sources" in value) || !Array.isArray(value.sources)) return false;
  return value.sources.every((source) => source && typeof source === "object" &&
    typeof source.source === "string" && Number.isInteger(source.chunkIndex) && source.chunkIndex >= 0 &&
    typeof source.content === "string" && typeof source.score === "number" && Number.isFinite(source.score));
}

/** Estado por ventana, sin persistencia ni dependencias del servidor. */
export function createChatSession(fetcher: typeof fetch = (...args) => fetch(...args)) {
  let state: ChatState = { messages: [], loading: false, error: null };
  const initial = state;
  const listeners = new Set<() => void>();
  const update = (next: ChatState) => { state = next; listeners.forEach((listener) => listener()); };
  const fail = (error: string): never => {
    update({ ...state, error });
    throw new Error(error);
  };
  return {
    getSnapshot: () => state,
    getServerSnapshot: () => initial,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    reset: () => { if (!state.loading) update({ messages: [], loading: false, error: null }); },
    async send(content: string): Promise<void> {
      // El bloqueo es síncrono, incluso antes de que React vuelva a renderizar.
      if (state.loading) throw new Error("Ya hay una consulta en curso.");
      if (!content.trim() || content.length > 4000) fail("Escribe una pregunta de entre 1 y 4000 caracteres.");
      if (state.messages.length + 1 > 20) fail("Alcanzaste el límite del historial. Inicia una nueva conversación para continuar.");
      const previous = state.messages;
      const pending: UiMessage[] = [...previous, { role: "user", content }];
      update({ messages: pending, loading: true, error: null });
      try {
        const response = await fetcher("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: pending.map(({ role, content }) => ({ role, content })) }),
          signal: AbortSignal.timeout(180_000),
        });
        if (!response.ok) throw new Error("HTTP");
        const payload: unknown = await response.json();
        if (!payload || typeof payload !== "object" || !("success" in payload) || payload.success !== true ||
            !("data" in payload) || !isChatResponse(payload.data)) throw new Error("Respuesta inválida");
        update({ messages: [...pending, { role: "assistant", content: payload.data.answer, sources: payload.data.sources }], loading: false, error: null });
      } catch {
        // No incorporar texto de errores remotos; el borrador permanece en el formulario.
        update({ messages: previous, loading: false, error: "No pudimos obtener una respuesta. Tu pregunta sigue en el campo; puedes editarla y volver a enviar." });
        throw new Error("Consulta fallida");
      }
    },
  };
}
