"use client";

import { useRef, useState } from "react";

export interface ChatInputProps {
  disabled: boolean;
  onSend: (content: string) => Promise<void>;
}

/** Se limpia solo tras éxito; el límite coincide con el endpoint actual. */
export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const sending = useRef(false);
  async function submit() {
    if (disabled || sending.current || !draft.trim() || draft.length > 4000) return;
    sending.current = true;
    try { await onSend(draft); setDraft(""); } catch { /* useChat expone el error sin borrar el borrador. */ }
    finally { sending.current = false; input.current?.focus(); }
  }
  return (
    <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="border-t border-zinc-200 p-4 dark:border-zinc-800">
      <label htmlFor="chat-question" className="mb-2 block text-sm font-medium">Tu pregunta</label>
      <textarea ref={input} id="chat-question" value={draft} onChange={(event) => setDraft(event.target.value)}
        disabled={disabled} maxLength={4000} rows={3} aria-describedby="chat-input-help"
        placeholder="Pregunta sobre los documentos…"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void submit(); }
        }}
        className="w-full resize-y rounded-lg border border-zinc-400 bg-transparent p-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-700 disabled:opacity-60 dark:border-zinc-600 dark:focus-visible:outline-zinc-200" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p id="chat-input-help" className="text-xs text-zinc-600 dark:text-zinc-400">Enter envía · Shift+Enter añade una línea · {draft.length}/4000</p>
        <button type="submit" disabled={disabled || !draft.trim()} className="min-h-11 rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          {disabled ? "Consultando…" : "Enviar"}
        </button>
      </div>
    </form>
  );
}
