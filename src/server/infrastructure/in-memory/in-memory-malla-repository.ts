import type { MallaRepository } from "@/server/application/ports/malla-repository";
import { MALLA_MOCK } from "@/mocks/malla";
import type { CursoMalla, MallaQuery } from "@/types";

/** Adaptador en memoria sobre los mocks: referencia para el repositorio real de Postgres y para pruebas. */
export class InMemoryMallaRepository implements MallaRepository {
  constructor(private readonly cursos: CursoMalla[] = MALLA_MOCK) {}

  async findAll({ areaFormativa, semestre, tipo }: MallaQuery): Promise<CursoMalla[]> {
    return this.cursos
      .filter(
        (c) =>
          (areaFormativa === undefined || c.areaFormativa === areaFormativa) &&
          (semestre === undefined || c.semestre === semestre) &&
          (tipo === undefined || c.tipo === tipo),
      )
      .sort((a, b) => a.semestre - b.semestre || a.codigo.localeCompare(b.codigo));
  }

  async findByCodigo(codigo: string): Promise<CursoMalla | null> {
    return this.cursos.find((c) => c.codigo === codigo) ?? null;
  }
}
