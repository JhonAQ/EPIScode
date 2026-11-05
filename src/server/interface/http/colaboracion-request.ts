import { TIPOS_INTERES } from "@/server/domain/solicitud-colaboracion";
import type { SolicitudColaboracion, TipoInteres } from "@/server/domain/solicitud-colaboracion";

export type ErroresColaboracion = Partial<Record<keyof SolicitudColaboracion | "formulario", string>>;

type ResultadoValidacion =
  | { valido: true; solicitud: SolicitudColaboracion }
  | { valido: false; errores: ErroresColaboracion };

const LIMITES = { nombre: 150, correo: 254, mensaje: 2000 } as const;

/** Valida datos externos y conserva mensajes por campo para el formulario. */
export function parseColaboracionRequest(body: unknown): ResultadoValidacion {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { valido: false, errores: { formulario: "Envía los datos del formulario en un objeto JSON." } };
  }

  const datos = body as Record<string, unknown>;
  const errores: ErroresColaboracion = {};

  function texto(campo: "nombre" | "correo" | "mensaje", etiqueta: string): string {
    const valor = datos[campo];
    if (typeof valor !== "string" || !valor.trim()) {
      errores[campo] = `Ingresa ${etiqueta}.`;
      return "";
    }
    const limpio = valor.trim();
    if (limpio.length > LIMITES[campo]) {
      errores[campo] = `Usa como máximo ${LIMITES[campo]} caracteres para ${etiqueta}.`;
    }
    return limpio;
  }

  const nombre = texto("nombre", "tu nombre o el de la empresa");
  const correo = texto("correo", "tu correo electrónico");
  const mensaje = texto("mensaje", "un mensaje");
  if (correo && !errores.correo && !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/u.test(correo)) {
    errores.correo = "Ingresa un correo válido, por ejemplo nombre@empresa.com.";
  }

  const tipo = datos.tipoInteres;
  if (typeof tipo !== "string" || !TIPOS_INTERES.some((opcion) => opcion === tipo)) {
    errores.tipoInteres = "Selecciona investigación, prácticas u alianzas estratégicas.";
  }

  if (Object.keys(errores).length > 0) return { valido: false, errores };
  return { valido: true, solicitud: { nombre, correo, tipoInteres: tipo as TipoInteres, mensaje } };
}
