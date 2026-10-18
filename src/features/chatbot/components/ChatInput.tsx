"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

export interface ChatInputProps {
  disabled: boolean;
  onSend: (content: string) => void | Promise<void>;
}

/** Recoge la pregunta, aplica el límite del endpoint y ofrece envío por botón o teclado. */
export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  /** Envía texto no vacío y limpia el campo después de aceptar la pregunta. */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = value.trim();

    if (disabled || content.length === 0 || content.length > 1000) {
      return;
    }

    void onSend(content);
    setValue("");
  }

  /** Conserva Shift+Enter como salto de línea y usa Enter para enviar. */
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const trimmedLength = value.trim().length;
  const canSend = trimmedLength > 0 && trimmedLength <= 1000 && !disabled;

  return (
    <form onSubmit={handleSubmit} className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <label htmlFor="chat-question" className="sr-only">
        Escribí tu pregunta
      </label>
      <textarea
        id="chat-question"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={1000}
        rows={3}
        disabled={disabled}
        placeholder="Escribí tu pregunta…"
        aria-describedby="chat-input-hint chat-character-count"
        className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:disabled:bg-zinc-800"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p id="chat-input-hint" className="text-xs text-zinc-600 dark:text-zinc-400">
          Enter para enviar · Shift+Enter para escribir en otra línea
        </p>
        <div className="flex items-center gap-3">
          <span id="chat-character-count" className="text-xs text-zinc-600 dark:text-zinc-400">
            {value.length}/1000
          </span>
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:bg-blue-900 disabled:text-white dark:disabled:bg-blue-950 dark:disabled:text-white"
          >
            {disabled ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </div>
    </form>
  );
}
