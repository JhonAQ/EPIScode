"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useChat } from "../hooks/useChat";
import { useChatResize } from "../hooks/useChatResize";
import { useChatInvitation } from "../hooks/useChatInvitation";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatLauncher } from "./ChatLauncher";
import { MessageList } from "./MessageList";
import { ChatResizeHandle } from "./ChatResizeHandle";

/** Coordina la apertura y los estados del chat sin mezclar el diseño de sus piezas. */
export function ChatWindow() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const { messages, loading, error, send } = useChat();
  const { panelRef, heightClassName, resizing, handleEvents } = useChatResize();
  const invitation = useChatInvitation();

  const panelStyles =
    "absolute bottom-0 right-0 flex origin-bottom-right flex-col overflow-hidden rounded-[2rem] border border-white bg-surface-muted shadow-widget";
  const sizeStyles =
    "min-h-[min(320px,calc(100dvh-3rem))] max-h-[calc(100dvh-3rem)] w-[min(710px,calc(100vw-3rem))]";
  const transitionStyles =
    "transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none";
  const visibilityStyles = {
    open: "visible translate-y-0 scale-100 opacity-100",
    closed: "invisible pointer-events-none translate-y-3 scale-95 opacity-0",
  };

  function openChat() {
    setOpen(true);
    requestAnimationFrame(() => {
      const panel = containerRef.current?.querySelector<HTMLElement>("[role='dialog']");
      const input = panel?.querySelector<HTMLInputElement>("input");
      if (input && !input.disabled) input.focus();
      else panel?.querySelector<HTMLButtonElement>("button")?.focus();
    });
  }

  function closeChat() {
    setOpen(false);
    requestAnimationFrame(() => containerRef.current?.querySelector<HTMLButtonElement>("[data-chat-launcher]")?.focus());
  }

  return (
    <section
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50"
      aria-label="Asistente virtual ANAI"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.stopPropagation();
          closeChat();
        }
      }}
    >
      {/* Conservar el panel permite animar el cierre sin perder el borrador. */}
      <div
        ref={panelRef}
        id="anai-chat-panel"
        role="dialog"
        aria-labelledby="anai-chat-title"
        aria-hidden={!open}
        inert={!open}
        className={cn(panelStyles, sizeStyles, heightClassName, transitionStyles, visibilityStyles[open ? "open" : "closed"])}
      >
        <ChatResizeHandle resizing={resizing} events={handleEvents} />
        <ChatHeader onClose={closeChat} />
        <MessageList messages={messages} loading={loading} error={error} />
        <ChatInput disabled={loading} onSend={send} />
      </div>
      {/* Retirar el acceso evita que se superponga durante la apertura del panel. */}
      {!open && <ChatLauncher onOpen={openChat} invitation={invitation} />}
    </section>
  );
}
