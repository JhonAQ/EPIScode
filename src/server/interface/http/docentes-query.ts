import { InvalidQueryError } from "@/server/domain/errors";
import type { DocentesQuery } from "@/types";

function texto(params: URLSearchParams, nombre: string): string | undefined {
  return params.get(nombre)?.trim() || undefined;
}

function entero(params: URLSearchParams, nombre: string): number | undefined {
  const raw = texto(params, nombre);
  if (raw === undefined) return undefined;
  const valor = Number(raw);
  if (!Number.isInteger(valor)) throw new InvalidQueryError(`\`${nombre}\` debe ser un número entero.`);
  return valor;
}

/**
 * Convierte la query string de `GET /api/docentes` en `DocentesQuery` (adaptador de entrada).
 * Solo cuida la FORMA; los rangos (page >= 1, pageSize <= 50) los valida el caso de uso.
 */
export function parseDocentesQuery(params: URLSearchParams): DocentesQuery {
  return {
    q: texto(params, "q"),
    departamento: texto(params, "departamento"),
    especialidad: texto(params, "especialidad"),
    page: entero(params, "page"),
    pageSize: entero(params, "pageSize"),
  };
}
