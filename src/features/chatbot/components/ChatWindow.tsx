"use client";

import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { useChat } from "../hooks/useChat";

/** Orquesta la conversación, los estados vacíos y el reintento de la última pregunta. */
export function ChatWindow() {
  const { messages, loading, error, send, retry } = useChat();

  return (
    <section
      aria-label="Conversación con el asistente EPIScode"
      className="mx-auto flex min-h-[min(70vh,48rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
    >
      {messages.length === 0 && !loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold">¿En qué te puedo ayudar?</h2>
          <p className="max-w-prose text-sm text-zinc-700 dark:text-zinc-300">
            Preguntá sobre EPIScode y revisá las fuentes que respaldan cada respuesta.
          </p>
          <button
            type="button"
            onClick={() => void send("¿Qué es EPIScode?")}
            className="mt-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            ¿Qué es EPIScode?
          </button>
        </div>
      )}

      {(messages.length > 0 || loading) && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessageList messages={messages} loading={loading} />
        </div>
      )}

      {error && (
        <div role="alert" className="mx-4 mb-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void retry()}
            className="mt-2 font-medium underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
          >
            Reintentar pregunta
          </button>
        </div>
      )}

      <ChatInput disabled={loading || error !== null} onSend={send} />
    </section>
  );
}
