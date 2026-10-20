/** Errores de dominio: la capa de interfaz decide cómo mostrarlos (p. ej. HTTP 400). */
export class InvalidConversationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConversationError";
  }
}
