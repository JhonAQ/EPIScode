import { InvalidQueryError } from "@/server/domain/errors";
import type { AreaFormativa, CursoMalla, Malla, MallaQuery, MallaVersion, TipoCurso } from "@/types";
import type { MallaRepository } from "../ports/malla-repository";

export const TIPOS_CURSO: readonly TipoCurso[] = ["Obligatorio", "General", "Núcleo"];

export const AREAS_FORMATIVAS: readonly AreaFormativa[] = [
  "Ciencias Básicas",
  "Formación General",
  "Computación",
  "Ingeniería de Software",
  "Sistemas de Información",
  "Redes y Sistemas",
];

export const VERSIONES_MALLA: readonly MallaVersion[] = [
  { id: "malla-2017", nombre: "Malla 2017", vigente: true },
  { id: "malla-2010", nombre: "Malla 2010", vigente: false },
];

/**
 * Caso de uso: entrega la malla de una versión con totales de cabecera,
 * filtrable por área formativa, semestre, tipo y búsqueda textual.
 *
 * Criterio clave: Los totales corresponden a la versión completa, no a lo filtrado.
 */
export class ListarMalla {
  constructor(
    private readonly mallaRepo: MallaRepository,
    private readonly versiones: readonly MallaVersion[] = VERSIONES_MALLA,
  ) {}

  async execute(query: MallaQuery = {}): Promise<Malla> {
    const { version: versionId, areaFormativa, semestre, tipo, q } = query;

    if (
      semestre !== undefined &&
      (!Number.isInteger(semestre) || semestre < 1 || semestre > 10)
    ) {
      throw new InvalidQueryError("`semestre` debe ser un número entero entre 1 y 10.");
    }

    if (tipo !== undefined && !TIPOS_CURSO.includes(tipo)) {
      throw new InvalidQueryError(
        `\`tipo\` desconocido: "${tipo}". Tipos permitidos: ${TIPOS_CURSO.join(", ")}.`,
      );
    }

    if (areaFormativa !== undefined && !AREAS_FORMATIVAS.includes(areaFormativa)) {
      throw new InvalidQueryError(
        `\`areaFormativa\` desconocida: "${areaFormativa}". Áreas permitidas: ${AREAS_FORMATIVAS.join(", ")}.`,
      );
    }

    let version: MallaVersion | undefined;
    if (versionId !== undefined) {
      version = this.versiones.find((v) => v.id === versionId);
      if (!version) {
        throw new InvalidQueryError(`Versión "${versionId}" no encontrada.`);
      }
    } else {
      version = this.versiones.find((v) => v.vigente) ?? this.versiones[0];
    }

    // Obtenemos los cursos de la versión completa para calcular los totales de la cabecera.
    const todosLosCursos = await this.mallaRepo.findAll({ version: version.id });

    const totalCreditos = todosLosCursos.reduce((sum, c) => sum + c.creditos, 0);
    const totalAsignaturas = todosLosCursos.length;
    const totalSemestres =
      todosLosCursos.length > 0 ? Math.max(...todosLosCursos.map((c) => c.semestre)) : 0;

    const tieneFiltros =
      areaFormativa !== undefined ||
      semestre !== undefined ||
      tipo !== undefined ||
      (q !== undefined && q.trim().length > 0);

    const cursos: CursoMalla[] = tieneFiltros
      ? await this.mallaRepo.findAll({
          version: version.id,
          areaFormativa,
          semestre,
          tipo,
          q,
        })
      : todosLosCursos;

    return {
      version,
      totalCreditos,
      totalSemestres,
      totalAsignaturas,
      cursos,
    };
  }
}
