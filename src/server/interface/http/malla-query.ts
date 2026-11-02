import { AREAS_FORMATIVAS, TIPOS_CURSO } from "@/server/application/use-cases/listar-malla";
import { InvalidQueryError } from "@/server/domain/errors";
import type { AreaFormativa, MallaQuery, Semestre, TipoCurso } from "@/types";

function texto(params: URLSearchParams, nombre: string): string | undefined {
  return params.get(nombre)?.trim() || undefined;
}

function parseSemestre(params: URLSearchParams): Semestre | undefined {
  const raw = texto(params, "semestre");
  if (raw === undefined) return undefined;

  const valor = Number(raw);
  if (!Number.isInteger(valor) || valor < 1 || valor > 10) {
    throw new InvalidQueryError("`semestre` debe ser un número entero entre 1 y 10.");
  }

  return valor as Semestre;
}

function parseTipo(params: URLSearchParams): TipoCurso | undefined {
  const raw = texto(params, "tipo");
  if (raw === undefined) return undefined;

  const coincidencia = TIPOS_CURSO.find((t) => t.toLowerCase() === raw.toLowerCase());
  if (!coincidencia) {
    throw new InvalidQueryError(
      `\`tipo\` desconocido: "${raw}". Tipos permitidos: ${TIPOS_CURSO.join(", ")}.`,
    );
  }

  return coincidencia;
}

function parseAreaFormativa(params: URLSearchParams): AreaFormativa | undefined {
  const raw = texto(params, "areaFormativa");
  if (raw === undefined) return undefined;

  const coincidencia = AREAS_FORMATIVAS.find((a) => a.toLowerCase() === raw.toLowerCase());
  if (!coincidencia) {
    throw new InvalidQueryError(
      `\`areaFormativa\` desconocida: "${raw}". Áreas permitidas: ${AREAS_FORMATIVAS.join(", ")}.`,
    );
  }

  return coincidencia;
}

/**
 * Convierte la query string de `GET /api/malla` en `MallaQuery` (adaptador de entrada).
 * Valida la forma y valores permitidos según los criterios de aceptación (400 en valores inválidos).
 */
export function parseMallaQuery(params: URLSearchParams): MallaQuery {
  return {
    version: texto(params, "version"),
    areaFormativa: parseAreaFormativa(params),
    semestre: parseSemestre(params),
    tipo: parseTipo(params),
    q: texto(params, "q"),
  };
}
