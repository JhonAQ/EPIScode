import type { CursoResumen, Docente } from "@/types";
import { MALLA_MOCK } from "./malla";

function resumen(codigo: string): CursoResumen {
  const curso = MALLA_MOCK.find((c) => c.codigo === codigo);
  if (!curso) throw new Error(`Mock inconsistente: el curso ${codigo} no está en la malla.`);
  return { codigo: curso.codigo, nombre: curso.nombre };
}

/** DATOS DE EJEMPLO (personas ficticias) para desarrollar sin backend. */
export const DOCENTES_MOCK: Docente[] = [
  {
    id: "doc-001",
    nombre: "Dr. Carlos Mendoza",
    cargo: "Docente Principal",
    grado: "Doctor en Ciencias de la Computación",
    correo: "cmendoza@example.edu.pe",
    departamento: "Ingeniería de Sistemas",
    especialidades: ["Inteligencia Artificial", "Ciencia de Datos"],
    cursos: ["IA501", "IA502"].map(resumen),
  },
  {
    id: "doc-002",
    nombre: "Mg. Lucía Paredes",
    cargo: "Docente Principal",
    grado: "Magíster en Ingeniería de Software",
    correo: "lparedes@example.edu.pe",
    departamento: "Ingeniería de Sistemas",
    especialidades: ["Ingeniería de Software", "Calidad de Software"],
    cursos: ["ING301", "ING401", "CAL601"].map(resumen),
  },
  {
    id: "doc-003",
    nombre: "Mg. Jorge Salas",
    cargo: "Docente Asociado",
    grado: "Magíster en Redes y Comunicaciones",
    correo: "jsalas@example.edu.pe",
    departamento: "Ingeniería de Sistemas",
    especialidades: ["Redes", "Ciberseguridad"],
    cursos: ["RED401", "RED402", "SEG501"].map(resumen),
  },
  {
    id: "doc-004",
    nombre: "Dra. Marta Condori",
    cargo: "Docente Principal",
    grado: "Doctora en Ingeniería de Sistemas",
    correo: "mcondori@example.edu.pe",
    departamento: "Ingeniería de Sistemas",
    especialidades: ["Bases de Datos", "Sistemas de Información"],
    cursos: ["BDD301", "BDD302", "SIS401"].map(resumen),
  },
  {
    id: "doc-005",
    nombre: "Ing. Ricardo Núñez",
    cargo: "Docente Asociado",
    grado: "Ingeniero de Sistemas",
    correo: "rnunez@example.edu.pe",
    departamento: "Ingeniería de Sistemas",
    especialidades: ["Programación", "Algoritmos"],
    cursos: ["PRG101", "PRG102", "PRG201", "ALG301"].map(resumen),
  },
  {
    id: "doc-006",
    nombre: "Dra. Elena Chávez",
    cargo: "Docente Principal",
    grado: "Doctora en Matemática Aplicada",
    correo: "echavez@example.edu.pe",
    departamento: "Ciencias Básicas",
    especialidades: ["Matemática Aplicada", "Estadística"],
    cursos: ["MAT101", "MAT102", "MAT103", "EST201"].map(resumen),
  },
  {
    id: "doc-007",
    nombre: "Mg. Pedro Alarcón",
    cargo: "Docente Asociado",
    grado: "Magíster en Física",
    correo: "palarcon@example.edu.pe",
    departamento: "Ciencias Básicas",
    especialidades: ["Física"],
    cursos: ["FIS101"].map(resumen),
  },
  {
    id: "doc-008",
    nombre: "Mg. Ana Gutiérrez",
    cargo: "Docente Asociada",
    grado: "Magíster en Comunicación",
    correo: "agutierrez@example.edu.pe",
    departamento: "Humanidades",
    especialidades: ["Comunicación", "Ética Profesional"],
    cursos: ["COM101", "FIL401", "ETI601"].map(resumen),
  },
];
