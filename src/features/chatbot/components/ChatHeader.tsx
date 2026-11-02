interface ChatHeaderProps {
  onClose: () => void;
}

/** Cabecera visual; el componente padre decide cómo cerrar la ventana. */
export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-border-subtle px-5 pb-4 pt-8 sm:px-8">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-epis-maroon text-white ring-4 ring-epis-maroon-light sm:size-20">
        <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" className="size-9 sm:size-11">
          <path d="M24 7v6m-4 0h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <rect x="12" y="15" width="24" height="18" rx="7" stroke="currentColor" strokeWidth="3" />
          <circle cx="19" cy="23" r="2" fill="currentColor" />
          <circle cx="29" cy="23" r="2" fill="currentColor" />
          <path d="M19 29h10M17 37c1.5-3 4-4 7-4s5.5 1 7 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <h2 id="anai-chat-title" className="text-2xl font-bold text-text-main">ANAI</h2>
        <p className="text-sm text-text-muted">Asistente Virtual EPIS</p>
        <p className="mt-1 flex items-center gap-2 text-sm text-text-main">
          <span className="size-2.5 rounded-full bg-status-online" aria-hidden="true" />
          En línea
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Cerrar chat de ANAI"
        className="size-11 shrink-0 rounded-full text-text-muted hover:scale-105 motion-reduce:scale-100 motion-reduce:transition-none"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Button>
    </header>
  );
}
import { Button } from "@/components/ui/Button";
