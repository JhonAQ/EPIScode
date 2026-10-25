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

/** Parámetros de `GET /api/malla`. Todos opcionales y combinables. */
export interface MallaQuery {
  areaFormativa?: AreaFormativa;
  semestre?: Semestre;
  tipo?: TipoCurso;
}
