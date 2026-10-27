export type TipoCurso = "Obligatorio" | "General" | "Núcleo";

export type AreaFormativa =
  | "Ciencias Básicas"
  | "Formación General"
  | "Computación"
  | "Ingeniería de Software"
  | "Sistemas de Información"
  | "Redes y Sistemas";

/** Semestres de la malla: 1 a 10. */
export type Semestre = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface CursoMalla {
  /** Código oficial, p. ej. "1701102". */
  codigo: string;
  nombre: string;
  creditos: number;
  semestre: Semestre;
  tipo: TipoCurso;
  areaFormativa: AreaFormativa;
  /** Códigos de los cursos que se deben aprobar antes. Vacío si no tiene. */
  prerrequisitos: string[];
}

/** Forma reducida de un curso, para listarlo dentro de otra entidad (p. ej. un docente). */
export type CursoResumen = Pick<CursoMalla, "codigo" | "nombre">;

/** Una versión del plan de estudios, p. ej. "Malla 2017". */
export interface MallaVersion {
  id: string;
  nombre: string;
  /** Solo una versión es la vigente. */
  vigente: boolean;
}

/** Malla completa de una versión, con los totales que muestra la cabecera. */
export interface Malla {
  version: MallaVersion;
  totalCreditos: number;
  totalSemestres: number;
  totalAsignaturas: number;
  cursos: CursoMalla[];
}

/** Parámetros de `GET /api/malla`. Todos opcionales y combinables. */
export interface MallaQuery {
  /** Id de la versión. Si falta, se usa la vigente. */
  version?: string;
  areaFormativa?: AreaFormativa;
  semestre?: Semestre;
  tipo?: TipoCurso;
  /** Busca por nombre o código del curso. */
  q?: string;
}
