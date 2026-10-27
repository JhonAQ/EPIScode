import type { CursoMalla, MallaQuery } from "@/types";

/** Puerto de salida: dónde vive la malla curricular (memoria, Postgres, etc.). */
export interface MallaRepository {
  /** Filtros combinados con AND, ordenados por semestre y luego por código. Sin filtros devuelve toda la malla. */
  findAll(filter: MallaQuery): Promise<CursoMalla[]>;
  /** `null` si no existe. */
  findByCodigo(codigo: string): Promise<CursoMalla | null>;
}
