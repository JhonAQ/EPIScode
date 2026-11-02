import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ChatResizeHandleProps {
  resizing: boolean;
  events: HTMLAttributes<HTMLDivElement>;
}

/** Tirador visible, con soporte para ratón, pantalla táctil y flechas del teclado. */
export function ChatResizeHandle({ resizing, events }: ChatResizeHandleProps) {
  const baseStyles =
    "group absolute top-0 left-1/2 z-10 flex h-7 w-28 -translate-x-1/2 touch-none select-none items-center justify-center rounded-full cursor-ns-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-epis-maroon/30";
  const gripStyles =
    "h-1.5 w-12 rounded-full bg-text-subtle transition-[width,background-color] duration-200 group-hover:w-16 group-hover:bg-epis-maroon group-focus-visible:bg-epis-maroon motion-reduce:transition-none";

  return (
    <div
      {...events}
      role="separator"
      tabIndex={0}
      aria-label="Ajustar altura del chat"
      aria-orientation="horizontal"
      aria-controls="anai-chat-panel"
      title="Arrastra hacia arriba o abajo para ajustar la altura. También puedes usar las flechas ↑ y ↓."
      className={baseStyles}
    >
      <span aria-hidden="true" className={cn(gripStyles, resizing && "w-16 bg-epis-maroon")} />
    </div>
  );
}
