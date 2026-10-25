import type { AreaFormativa, CursoMalla, Semestre, TipoCurso } from "@/types";

/**
 * DATOS DE EJEMPLO para desarrollar sin backend. No son la malla oficial:
 * reemplazar con la real cuando se tenga (mismo formato `CursoMalla`).
 */
function curso(
  semestre: Semestre,
  codigo: string,
  nombre: string,
  creditos: number,
  tipo: TipoCurso,
  areaFormativa: AreaFormativa,
  prerrequisitos: string[] = [],
): CursoMalla {
  return { codigo, nombre, creditos, semestre, tipo, areaFormativa, prerrequisitos };
}

export const MALLA_MOCK: CursoMalla[] = [
  curso(1, "MAT101", "Matemática I", 4, "Obligatorio", "Ciencias Básicas"),
  curso(1, "COM101", "Comunicación", 3, "General", "Formación General"),
  curso(1, "INF101", "Introducción a la Ingeniería de Sistemas", 3, "Obligatorio", "Computación"),
  curso(1, "PRG101", "Fundamentos de Programación", 4, "Núcleo", "Computación"),

  curso(2, "MAT102", "Matemática II", 4, "Obligatorio", "Ciencias Básicas", ["MAT101"]),
  curso(2, "MAT103", "Matemática Discreta", 4, "Obligatorio", "Ciencias Básicas", ["MAT101"]),
  curso(2, "FIS101", "Física I", 4, "Obligatorio", "Ciencias Básicas", ["MAT101"]),
  curso(2, "PRG102", "Programación Orientada a Objetos", 4, "Núcleo", "Computación", ["PRG101"]),

  curso(3, "PRG201", "Estructuras de Datos", 4, "Núcleo", "Computación", ["PRG102", "MAT103"]),
  curso(3, "EST201", "Estadística y Probabilidades", 3, "Obligatorio", "Ciencias Básicas", ["MAT102"]),
  curso(3, "ARQ201", "Arquitectura de Computadoras", 4, "Obligatorio", "Redes y Sistemas", ["FIS101", "MAT103"]),
  curso(3, "ECO201", "Economía y Contabilidad", 3, "General", "Formación General"),

  curso(4, "BDD301", "Bases de Datos I", 4, "Núcleo", "Sistemas de Información", ["PRG201"]),
  curso(4, "ALG301", "Análisis y Diseño de Algoritmos", 4, "Núcleo", "Computación", ["PRG201", "MAT103"]),
  curso(4, "SOP301", "Sistemas Operativos", 4, "Obligatorio", "Redes y Sistemas", ["ARQ201"]),
  curso(4, "ING301", "Ingeniería de Requisitos", 3, "Obligatorio", "Ingeniería de Software", ["PRG102"]),

  curso(5, "BDD302", "Bases de Datos II", 4, "Núcleo", "Sistemas de Información", ["BDD301"]),
  curso(5, "ING401", "Ingeniería de Software I", 4, "Núcleo", "Ingeniería de Software", ["ING301", "BDD301"]),
  curso(5, "RED401", "Redes de Computadoras I", 4, "Obligatorio", "Redes y Sistemas", ["SOP301"]),
  curso(5, "FIL401", "Filosofía y Pensamiento Crítico", 2, "General", "Formación General"),

  curso(6, "ING402", "Ingeniería de Software II", 4, "Núcleo", "Ingeniería de Software", ["ING401"]),
  curso(6, "RED402", "Redes de Computadoras II", 4, "Obligatorio", "Redes y Sistemas", ["RED401"]),
  curso(6, "WEB401", "Desarrollo de Aplicaciones Web", 4, "Obligatorio", "Ingeniería de Software", ["BDD301", "PRG102"]),
  curso(6, "SIS401", "Sistemas de Información", 3, "Obligatorio", "Sistemas de Información", ["BDD302"]),

  curso(7, "IA501", "Inteligencia Artificial", 4, "Núcleo", "Computación", ["ALG301", "EST201"]),
  curso(7, "SEG501", "Seguridad Informática", 3, "Obligatorio", "Redes y Sistemas", ["RED402"]),
  curso(7, "ING501", "Arquitectura de Software", 4, "Núcleo", "Ingeniería de Software", ["ING402"]),
  curso(7, "GES501", "Gestión de Proyectos de TI", 3, "Obligatorio", "Sistemas de Información", ["ING402"]),

  curso(8, "IA502", "Aprendizaje Automático", 4, "Obligatorio", "Computación", ["IA501"]),
  curso(8, "CLD601", "Computación en la Nube", 3, "Obligatorio", "Redes y Sistemas", ["RED402", "SOP301"]),
  curso(8, "CAL601", "Calidad y Pruebas de Software", 3, "Obligatorio", "Ingeniería de Software", ["ING501"]),
  curso(8, "ETI601", "Ética y Responsabilidad Profesional", 2, "General", "Formación General"),

  curso(9, "TES701", "Taller de Tesis I", 4, "Obligatorio", "Sistemas de Información", ["GES501"]),
  curso(9, "SIS701", "Inteligencia de Negocios", 3, "Obligatorio", "Sistemas de Información", ["SIS401", "EST201"]),
  curso(9, "EMP701", "Emprendimiento e Innovación", 3, "General", "Formación General", ["GES501"]),
  curso(9, "ELE701", "Electivo Profesional I", 3, "Obligatorio", "Computación", ["ING501"]),

  curso(10, "TES702", "Taller de Tesis II", 4, "Obligatorio", "Sistemas de Información", ["TES701"]),
  curso(10, "PRA801", "Prácticas Preprofesionales", 4, "Obligatorio", "Ingeniería de Software", ["TES701"]),
  curso(10, "ELE801", "Electivo Profesional II", 3, "Obligatorio", "Computación", ["ELE701"]),
  curso(10, "GOB801", "Gobierno de TI", 3, "Obligatorio", "Sistemas de Información", ["SIS701"]),
];
