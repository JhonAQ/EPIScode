"use client";

import { useChat } from "../hooks/useChat";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

export function ChatWindow() {
  const { messages, loading, error, send, reset } = useChat();
  return (
    <section lang="es" aria-label="Consulta documental" className="mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-zinc-300 bg-background shadow-sm dark:border-zinc-700">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div><h2 className="font-semibold">Consulta tus documentos</h2><p className="text-sm text-zinc-600 dark:text-zinc-400">Respuestas con contexto y fuentes para revisar.</p></div>
        <button type="button" onClick={reset} disabled={loading || messages.length === 0} className="min-h-11 rounded-lg border border-zinc-300 px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 dark:border-zinc-700">Nueva conversación</button>
      </header>
      <MessageList messages={messages} loading={loading} />
      {error && <p role="alert" className="mx-4 mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">{error}</p>}
      <ChatInput disabled={loading} onSend={send} />
      <p className="px-4 pb-4 text-xs text-zinc-600 dark:text-zinc-400">Revisa las fuentes: una cita no garantiza que toda la respuesta esté respaldada. El historial se conserva solo mientras esta página esté abierta.</p>
    </section>
  );
}
