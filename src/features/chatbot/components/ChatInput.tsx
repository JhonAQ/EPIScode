export interface ChatInputProps {
  disabled: boolean;
  onSend: (content: string) => void;
}

/**
 * TODO (Integrante D): caja de texto + botón enviar.
 * Enter envía, Shift+Enter hace salto de línea, deshabilitado mientras `disabled`,
 * respeta el límite de 1000 caracteres que valida el backend y limpia el campo al enviar.
 */
export function ChatInput({ disabled, onSend }: ChatInputProps) {
  void disabled;
  void onSend;
  throw new Error("TODO: implementar ChatInput");
}
