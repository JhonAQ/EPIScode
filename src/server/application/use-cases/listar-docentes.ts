import { InvalidQueryError } from "@/server/domain/errors";
import type { Docente, DocentesQuery, Paginado } from "@/types";
import type { DocenteRepository } from "../ports/docente-repository";

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

/** Caso de uso: directorio docente con búsqueda, filtros y paginación. */
export class ListarDocentes {
  constructor(private readonly docentes: DocenteRepository) {}

  async execute(query: DocentesQuery): Promise<Paginado<Docente>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

    if (!Number.isInteger(page) || page < 1) {
      throw new InvalidQueryError("`page` debe ser un entero mayor o igual a 1.");
    }
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new InvalidQueryError(`\`pageSize\` debe ser un entero entre 1 y ${MAX_PAGE_SIZE}.`);
    }

    const { q, departamento, especialidad } = query;
    return this.docentes.search({ q, departamento, especialidad }, { page, pageSize });
  }
}
