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
    nombre: "Carlos Mendoza Rivera",
    grado: "Doctor",
    correo: "cmendoza@example.edu.pe",
    departamento: "Ingeniería de Sistemas e Informática",
    especialidades: ["Inteligencia Artificial", "Ciencia de Datos"],
    cursos: ["IA501", "IA502"].map(resumen),
  },
  {
    id: "doc-002",
    nombre: "Lucía Paredes Quispe",
    grado: "Magíster",
    correo: "lparedes@example.edu.pe",
    departamento: "Ingeniería de Sistemas e Informática",
    especialidades: ["Ingeniería de Software", "Calidad de Software"],
    cursos: ["ING301", "ING401", "CAL601"].map(resumen),
  },
  {
    id: "doc-003",
    nombre: "Jorge Salas Huamán",
    grado: "Magíster",
    correo: "jsalas@example.edu.pe",
    departamento: "Ingeniería de Sistemas e Informática",
    especialidades: ["Redes", "Ciberseguridad"],
    cursos: ["RED401", "RED402", "SEG501"].map(resumen),
  },
  {
    id: "doc-004",
    nombre: "Marta Condori Flores",
    grado: "Doctor",
    correo: "mcondori@example.edu.pe",
    departamento: "Ingeniería de Sistemas e Informática",
    especialidades: ["Bases de Datos", "Sistemas de Información"],
    cursos: ["BDD301", "BDD302", "SIS401"].map(resumen),
  },
  {
    id: "doc-005",
    nombre: "Ricardo Núñez Vargas",
    grado: "Ingeniero",
    correo: "rnunez@example.edu.pe",
    departamento: "Ingeniería de Sistemas e Informática",
    especialidades: ["Programación", "Algoritmos"],
    cursos: ["PRG101", "PRG102", "PRG201", "ALG301"].map(resumen),
  },
  {
    id: "doc-006",
    nombre: "Elena Chávez Torres",
    grado: "Doctor",
    correo: "echavez@example.edu.pe",
    departamento: "Ciencias Básicas",
    especialidades: ["Matemática Aplicada", "Estadística"],
    cursos: ["MAT101", "MAT102", "MAT103", "EST201"].map(resumen),
  },
  {
    id: "doc-007",
    nombre: "Pedro Alarcón Medina",
    grado: "Magíster",
    correo: "palarcon@example.edu.pe",
    departamento: "Ciencias Básicas",
    especialidades: ["Física"],
    cursos: ["FIS101"].map(resumen),
  },
  {
    id: "doc-008",
    nombre: "Ana Gutiérrez Luna",
    grado: "Magíster",
    correo: "agutierrez@example.edu.pe",
    departamento: "Humanidades",
    especialidades: ["Comunicación", "Ética Profesional"],
    cursos: ["COM101", "FIL401", "ETI601"].map(resumen),
  },
];
