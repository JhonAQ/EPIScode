export type RagStage = "embedding" | "retrieval" | "prompt" | "llm" | "unknown";
export type LlmProvider = "gemini" | "groq" | "openrouter";

/**
 * Error interno que conserva solo los datos seguros para diagnosticar un fallo RAG.
 * No guarda el mensaje original ni el cuerpo devuelto por el proveedor.
 */
export class RagDiagnosticError extends Error {
  /** Crea un error de diagnóstico asociado a una etapa del flujo RAG. */
  constructor(
    readonly stage: RagStage,
    readonly details: {
      provider?: LlmProvider;
      status?: number;
      errorName?: string;
      errorMessage?: string;
    } = {},
  ) {
    super("RAG operation failed");
    this.name = "RagDiagnosticError";
  }
}

/**
 * Convierte un error a los campos permitidos en los registros del servidor.
 * Los errores inesperados se representan sin exponer su mensaje ni sus datos.
 */
export function formatRagDiagnostic(error: unknown): Record<string, string | number> {
  // Los errores inesperados se describen con campos limitados; no serializamos el objeto original.
  if (!(error instanceof RagDiagnosticError)) {
    return formatUnexpectedError(error);
  }

  // Construimos el objeto paso a paso para incluir únicamente los datos disponibles.
  const diagnostic: Record<string, string | number> = {
    stage: error.stage,
  };

  if (error.details.provider) {
    diagnostic.provider = error.details.provider;
  }

  const status = error.details.status;
  if (typeof status === "number" && Number.isInteger(status)) {
    diagnostic.status = status;
  }

  if (error.details.errorName) {
    diagnostic.errorName = sanitizeErrorName(error.details.errorName);
  }

  if (error.details.errorMessage) {
    diagnostic.errorMessage = sanitizeErrorMessage(error.details.errorMessage);
  }

  // Derivamos un detalle seguro solo para proveedores permitidos y estados HTTP enteros.
  const allowedProviders: LlmProvider[] = ["gemini", "groq", "openrouter"];
  if (
    allowedProviders.includes(error.details.provider as LlmProvider)
    && typeof status === "number"
    && Number.isInteger(status)
  ) {
    diagnostic.errorName ??= "ProviderHttpError";
    diagnostic.errorMessage ??= `The provider returned HTTP ${status}.`;
  }

  return diagnostic;
}

/** Convierte un valor desconocido en campos acotados sin exponer sus propiedades. */
function formatUnexpectedError(error: unknown): Record<string, string | number> {
  // Solo inspeccionamos errores nativos; otros objetos podrían revelar secretos mediante getters.
  if (!(error instanceof Error)) {
    return { stage: "unknown" };
  }

  // Copiamos únicamente el nombre y el mensaje saneados; nunca propagamos la excepción original.
  return {
    stage: "unknown",
    errorName: sanitizeErrorName(error.name),
    errorMessage: sanitizeErrorMessage(error.message),
  };
}

/** Limita el nombre del error a un identificador breve, sin controles ni valores extensos. */
function sanitizeErrorName(name: string): string {
  // Conservamos caracteres habituales de identificadores y limitamos el resultado para evitar saturar los registros.
  const safeName = name.replace(/[^a-zA-Z0-9_$]/g, "").slice(0, 40);
  return safeName || "Error";
}

/** Oculta secretos comunes y texto SQL, y limita el mensaje de diagnóstico a un tamaño fijo. */
export function sanitizeErrorMessage(message: string, sensitiveValues: string[] = []): string {
  // Ocultamos primero el contenido exacto de la conversación, incluso si el proveedor lo repite.
  let safeMessage = message;
  for (const sensitiveValue of sensitiveValues) {
    if (sensitiveValue.length > 0) {
      safeMessage = safeMessage.split(sensitiveValue).join("[redacted]");
    }
  }

  // PostgreSQL puede incluir valores privados en detalles de claves y filas rechazadas.
  safeMessage = safeMessage
    .replace(/\bKey\s+\([^)]*\)=\([^)]*\)(?:\s+[^.\r\n]*)?/gi, "[SQL values omitted]")
    .replace(/\bDETAIL:\s*Failing row contains\s*\([^)]*\)/gi, "DETAIL: [SQL values omitted]");

  // Reemplazamos sentencias SQL completas porque pueden contener valores literales o texto del usuario.
  safeMessage = safeMessage.replace(/\b(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b[\s\S]*/gi, "[SQL statement omitted]");

  // Ocultamos formatos habituales de credenciales antes de conservar el texto explicativo.
  safeMessage = safeMessage
    .replace(/\b(Bearer\s+)\S+/gi, "$1[redacted]")
    .replace(/\b(api[_-]?key|password|token|secret)\s*[:=]\s*[^\s;,]+/gi, "$1=[redacted]")
    .replace(/\bsk-[a-zA-Z0-9_-]+/g, "[redacted]");

  // Excluimos caracteres de control y acotamos el valor para limitar inyección y volumen de registros.
  return safeMessage.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 200);
}
