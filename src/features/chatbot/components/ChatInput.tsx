"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

export interface ChatInputProps {
  disabled: boolean;
  onSend: (content: string) => void;
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const formStyles =
    "mx-5 mb-5 flex items-center gap-3 rounded-full border border-border-subtle bg-white p-2 shadow-card-soft transition-shadow focus-within:ring-2 focus-within:ring-border-focus sm:mx-8 sm:mb-8";
  const inputStyles =
    "min-w-0 flex-1 bg-transparent px-2 py-2 text-base text-text-main outline-none placeholder:text-text-muted disabled:cursor-not-allowed sm:px-3";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = value.trim();
    if (!content || disabled) return;

    onSend(content);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className={formStyles}>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        maxLength={1000}
        aria-label="Escribe tu mensaje"
        placeholder="Escribe tu mensaje..."
        className={inputStyles}
      />
      <Button
        type="submit"
        variant="primary"
        size="icon"
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensaje"
        className="size-12 shrink-0 rounded-full disabled:opacity-50 enabled:hover:scale-105 motion-reduce:scale-100 motion-reduce:transition-none"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-6">
          <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
    </form>
  );
}
