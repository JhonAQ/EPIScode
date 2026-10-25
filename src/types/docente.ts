import type { CursoResumen } from "./malla";

export type GradoAcademico = "Bachiller" | "Ingeniero" | "Magíster" | "Doctor";

export interface Docente {
  id: string;
  nombre: string;
  grado: GradoAcademico;
  correo: string;
  departamento: string;
  especialidades: string[];
  /** Cursos que dicta; el detalle completo se consulta en la malla. */
  cursos: CursoResumen[];
}

/** Parámetros de `GET /api/docentes`. Todos opcionales y combinables. */
export interface DocentesQuery {
  /** Texto libre: nombre, especialidad o curso. Ignora mayúsculas y tildes. */
  q?: string;
  departamento?: string;
  especialidad?: string;
  /** Empieza en 1. Por defecto 1. */
  page?: number;
  /** Por defecto 10, máximo 50. */
  pageSize?: number;
}
