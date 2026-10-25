import type { DocenteFilter, DocenteRepository, PageRequest } from "@/server/application/ports/docente-repository";
import { normalizarTexto } from "@/server/domain/services/normalizar-texto";
import { DOCENTES_MOCK } from "@/mocks/docentes";
import type { Docente, Paginado } from "@/types";

/** Adaptador en memoria sobre los mocks: referencia para el repositorio real de Postgres y para pruebas. */
export class InMemoryDocenteRepository implements DocenteRepository {
  constructor(private readonly docentes: Docente[] = DOCENTES_MOCK) {}

  async search(filter: DocenteFilter, { page, pageSize }: PageRequest): Promise<Paginado<Docente>> {
    const q = filter.q ? normalizarTexto(filter.q) : undefined;
    const departamento = filter.departamento ? normalizarTexto(filter.departamento) : undefined;
    const especialidad = filter.especialidad ? normalizarTexto(filter.especialidad) : undefined;

    const coincidentes = this.docentes.filter((d) => {
      if (departamento && normalizarTexto(d.departamento) !== departamento) return false;
      if (especialidad && !d.especialidades.some((e) => normalizarTexto(e) === especialidad)) return false;
      if (q) {
        const texto = normalizarTexto(
          [d.nombre, ...d.especialidades, ...d.cursos.map((c) => c.nombre)].join(" "),
        );
        if (!texto.includes(q)) return false;
      }
      return true;
    });

    const start = (page - 1) * pageSize;
    return {
      items: coincidentes.slice(start, start + pageSize),
      total: coincidentes.length,
      page,
      pageSize,
      totalPages: Math.ceil(coincidentes.length / pageSize),
    };
  }

  async findById(id: string): Promise<Docente | null> {
    return this.docentes.find((d) => d.id === id) ?? null;
  }
}
