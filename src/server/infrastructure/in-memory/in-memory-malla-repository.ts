import type { MallaRepository } from "@/server/application/ports/malla-repository";
import { normalizarTexto } from "@/server/domain/services/normalizar-texto";
import { MALLA_MOCK } from "@/mocks/malla";
import type { CursoMalla, MallaQuery } from "@/types";

/** Adaptador en memoria sobre los mocks: referencia para el repositorio real de Postgres y para pruebas. */
export class InMemoryMallaRepository implements MallaRepository {
  constructor(private readonly cursos: CursoMalla[] = MALLA_MOCK) {}

  async findAll({ areaFormativa, semestre, tipo, q }: MallaQuery): Promise<CursoMalla[]> {
    const qNorm = q ? normalizarTexto(q) : undefined;

    return this.cursos
      .filter((c) => {
        if (areaFormativa !== undefined && c.areaFormativa !== areaFormativa) return false;
        if (semestre !== undefined && c.semestre !== semestre) return false;
        if (tipo !== undefined && c.tipo !== tipo) return false;
        if (qNorm !== undefined) {
          const texto = normalizarTexto(`${c.codigo} ${c.nombre}`);
          if (!texto.includes(qNorm)) return false;
        }
        return true;
      })
      .sort((a, b) => a.semestre - b.semestre || a.codigo.localeCompare(b.codigo));
  }

  async findByCodigo(codigo: string): Promise<CursoMalla | null> {
    return this.cursos.find((c) => c.codigo === codigo) ?? null;
  }
}
