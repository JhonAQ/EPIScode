import type { Docente, Paginado } from "@/types";

export interface DocenteFilter {
  /** Texto libre: nombre, especialidad o curso. */
  q?: string;
  departamento?: string;
  especialidad?: string;
}

export interface PageRequest {
  /** Empieza en 1. */
  page: number;
  pageSize: number;
}

/** Puerto de salida: dónde viven los docentes (memoria, Postgres, etc.). */
export interface DocenteRepository {
  /** Aplica los filtros (combinados con AND) y devuelve solo la página pedida. `total` cuenta todos los que coinciden. */
  search(filter: DocenteFilter, pageRequest: PageRequest): Promise<Paginado<Docente>>;
  /** `null` si no existe. */
  findById(id: string): Promise<Docente | null>;
}
