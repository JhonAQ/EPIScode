import type { CursoResumen } from "./malla";

export interface Docente {
  id: string;
  /** Tal como se muestra en la tarjeta, con tratamiento: "Dr. Carlos Mendoza". */
  nombre: string;
  /** Categoría que se muestra bajo el nombre: "Docente Principal", "Docente Asociada". */
  cargo: string;
  /** Grado académico en texto: "Doctor en Ciencias de la Computación". */
  grado: string;
  correo: string;
  /** URL de la foto. Si falta, el frontend muestra un recuadro de reemplazo. */
  fotoUrl?: string;
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
  /** Por defecto 12 en el diseño; máximo 50. */
  pageSize?: number;
}
