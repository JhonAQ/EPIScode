import { Button } from "@/components/ui/Button";
import { CHAT_INVITATIONS } from "../constants/chat-invitations";

interface ChatLauncherProps {
  onOpen: () => void;
  invitation?: string | null;
}

/** Acceso al chat: muestra el texto completo en escritorio y prioriza el botón en móvil. */
export function ChatLauncher({ onOpen, invitation = CHAT_INVITATIONS[0] }: ChatLauncherProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      {invitation && (
        <span className="hidden max-w-[calc(100vw-9rem)] rounded-full border border-border-subtle bg-white px-5 py-3 text-base font-semibold text-slate-700 shadow-widget md:block">
          {invitation} Pregunta a <strong className="text-epis-maroon">ANAI</strong>
        </span>
      )}
      <Button
        type="button"
        variant="primary"
        size="icon"
        data-chat-launcher
        onClick={onOpen}
        aria-label="Abrir chat de ANAI"
        aria-expanded={false}
        aria-controls="anai-chat-panel"
        className="relative size-[4.5rem] shrink-0 rounded-full border-[6px] border-epis-maroon-light text-xl font-bold shadow-widget hover:scale-105 motion-reduce:scale-100 motion-reduce:transition-none"
      >
        AI
        <span className="absolute right-0 top-0 size-4 rounded-full border-2 border-white bg-status-online" aria-hidden="true" />
      </Button>
    </div>
  );
}
