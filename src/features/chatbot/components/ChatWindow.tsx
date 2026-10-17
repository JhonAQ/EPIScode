"use client";
import { useChat } from "../hooks/useChat";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
export function ChatWindow() {
  const { messages, loading, error, send, retry } = useChat();
  return <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-300 shadow-sm">
    {!messages.length && <div className="p-6"><h2 className="text-lg font-semibold">Conversa con tu documento</h2>
      <p className="mt-2 text-sm text-zinc-500">Las respuestas se basan en la documentación cargada y muestran sus fuentes.</p>
      <div className="mt-4 flex flex-wrap gap-2">{["¿Qué significa RAG?", "¿Para qué sirve el overlap?", "Resume los pasos de la ingesta en orden."].map(q =>
        <button key={q} disabled={loading} onClick={() => void send(q)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-900">{q}</button>)}</div></div>}
    <MessageList messages={messages} loading={loading} />
    {error && <div role="alert" className="mx-4 mb-4 rounded-lg border border-red-300 p-3 text-sm text-red-600">{error} <button disabled={loading} onClick={() => void retry()} className="ml-2 underline">Reintentar</button></div>}
    <ChatInput disabled={loading} onSend={content => void send(content)} />
  </section>;
}
