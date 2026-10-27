/** Errores de dominio: la capa de interfaz decide cómo mostrarlos (p. ej. HTTP 400). */
export class InvalidConversationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConversationError";
  }
}

/** Parámetros de consulta inválidos (p. ej. `page=0`). La capa HTTP los responde con 400. */
export class InvalidQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidQueryError";
  }
}
