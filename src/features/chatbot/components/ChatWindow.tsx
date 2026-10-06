"use client";

/**
 * TODO (Integrante D): componer el chat completo.
 *
 * Estructura sugerida (cada pieza en su archivo dentro de esta carpeta):
 *   <ChatWindow>            <- este archivo: usa useChat() y orquesta
 *     <MessageList />       <- lista de mensajes, scroll automático al final
 *       <MessageBubble />   <- burbuja usuario/asistente (estilo distinto, Markdown opcional)
 *       <SourcesList />     <- fuentes colapsables bajo cada respuesta del asistente
 *     <ChatInput />         <- caja de texto + botón enviar (Enter envía, Shift+Enter salto de línea)
 *
 * Estados a contemplar: vacío (sugerir preguntas de ejemplo), cargando ("pensando..."),
 * error (con opción de reintentar) y respuesta sin fuentes.
 *
 * Tienen Tailwind v4 y la utilidad cn() de "@/lib/utils". Diseñen primero en Figma
 * (ver nota en el README sobre components/).
 */
export function ChatWindow() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-dashed border-zinc-400 p-8 text-center text-sm text-zinc-500">
      TODO: implementar ChatWindow en src/features/chatbot/components/ChatWindow.tsx
    </div>
  );
}
