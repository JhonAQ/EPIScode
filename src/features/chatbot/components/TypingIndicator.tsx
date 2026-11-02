import { cn } from "@/lib/utils";

/** Indica que ANAI está preparando una respuesta, sin depender del contenido del mensaje. */
export function TypingIndicator() {
  const containerStyles =
    "inline-flex items-center gap-3 self-start rounded-full bg-surface-subtle px-4 py-3 text-sm text-text-muted";
  const dotStyles =
    "size-1.5 rounded-full bg-epis-maroon animate-bounce motion-reduce:animate-none";
  const dotDelays = [
    "[animation-delay:0ms]",
    "[animation-delay:150ms]",
    "[animation-delay:300ms]",
  ];

  return (
    <div role="status" className={containerStyles}>
      <span>ANAI está escribiendo…</span>
      {/* Los puntos son decorativos; el lector de pantalla anuncia solo el texto. */}
      <span aria-hidden="true" className="flex items-center gap-1">
        {dotDelays.map((delay) => (
          <span key={delay} className={cn(dotStyles, delay)} />
        ))}
      </span>
    </div>
  );
}
