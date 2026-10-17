"use client";
import { useState } from "react";
export interface ChatInputProps { disabled: boolean; onSend: (content: string) => void }
export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  function send() { if (!disabled && text.trim()) { onSend(text.trim()); setText(""); } }
  return <form className="flex items-end gap-3 border-t border-zinc-300 p-4" onSubmit={e => { e.preventDefault(); send(); }}>
    <div className="flex-1"><label htmlFor="question" className="mb-2 block text-sm font-medium">Tu pregunta</label>
      <textarea id="question" value={text} maxLength={1000} disabled={disabled} rows={2} placeholder="Pregunta sobre el documento..." className="w-full resize-none rounded-lg border border-zinc-400 p-3" onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
      <p className="text-xs text-zinc-500">{text.length}/1000 · Shift+Enter para un salto de línea</p></div>
    <button disabled={disabled || !text.trim()} className="mb-5 rounded-lg bg-indigo-600 px-5 py-3 text-white disabled:opacity-40">Enviar</button>
  </form>;
}
