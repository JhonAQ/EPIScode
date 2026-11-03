import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MALLA_MOCK } from "@/mocks/malla";
import type { CursoMalla, Semestre } from "@/types";
import { validarMalla } from "./validar-malla";

function crearCurso(
  codigo: string,
  semestre: Semestre,
  prerrequisitos: string[] = [],
): CursoMalla {
  return {
    codigo,
    nombre: `Curso ${codigo}`,
    creditos: 4,
    semestre,
    tipo: "Obligatorio",
    areaFormativa: "Computación",
    prerrequisitos,
  };
}

describe("validarMalla", () => {
  it("malla válida mínima devuelve []", () => {
    const cursos: CursoMalla[] = [
      crearCurso("PRG101", 1, []),
      crearCurso("PRG102", 2, ["PRG101"]),
    ];
    const problemas = validarMalla(cursos);
    assert.deepEqual(problemas, []);
  });

  it("malla con código duplicado", () => {
    const cursos: CursoMalla[] = [
      crearCurso("PRG101", 1, []),
      crearCurso("PRG101", 1, []),
    ];
    const problemas = validarMalla(cursos);
    assert.equal(problemas.length, 1);
    assert.equal(problemas[0].codigo, "PRG101");
    assert.equal(problemas[0].tipo, "CODIGO_DUPLICADO");
  });

  it("malla con prerrequisito inexistente", () => {
    const cursos: CursoMalla[] = [
      crearCurso("PRG102", 2, ["NO_EXISTE"]),
    ];
    const problemas = validarMalla(cursos);
    assert.equal(problemas.length, 1);
    assert.equal(problemas[0].codigo, "PRG102");
    assert.equal(problemas[0].tipo, "PRERREQUISITO_INEXISTENTE");
  });

  it("malla con prerrequisito en el mismo semestre", () => {
    const cursos: CursoMalla[] = [
      crearCurso("PRG101", 1, []),
      crearCurso("MAT101", 1, ["PRG101"]),
    ];
    const problemas = validarMalla(cursos);
    assert.equal(problemas.length, 1);
    assert.equal(problemas[0].codigo, "MAT101");
    assert.equal(problemas[0].tipo, "PRERREQUISITO_SEMESTRE_INVALIDO");
  });

  it("malla con prerrequisito en semestre posterior", () => {
    const cursos: CursoMalla[] = [
      crearCurso("PRG101", 1, ["MAT102"]),
      crearCurso("MAT102", 2, []),
    ];
    const problemas = validarMalla(cursos);
    assert.equal(problemas.length, 1);
    assert.equal(problemas[0].codigo, "PRG101");
    assert.equal(problemas[0].tipo, "PRERREQUISITO_SEMESTRE_INVALIDO");
  });

  it("malla con ciclo directo e indirecto", () => {
    // Ciclo directo: A <-> B (ambos deben tener CICLO_DETECTADO)
    const cicloDirecto: CursoMalla[] = [
      crearCurso("A", 1, ["B"]),
      crearCurso("B", 2, ["A"]),
    ];
    const problemasDirecto = validarMalla(cicloDirecto);
    const ciclosDirecto = problemasDirecto.filter((p) => p.tipo === "CICLO_DETECTADO");
    assert.equal(ciclosDirecto.length, 2);
    assert.deepEqual(
      ciclosDirecto.map((p) => p.codigo).sort(),
      ["A", "B"],
    );

    // Ciclo indirecto: X -> Y -> Z -> X
    const cicloIndirecto: CursoMalla[] = [
      crearCurso("X", 1, ["Y"]),
      crearCurso("Y", 2, ["Z"]),
      crearCurso("Z", 3, ["X"]),
    ];
    const problemasIndirecto = validarMalla(cicloIndirecto);
    const ciclosIndirecto = problemasIndirecto.filter((p) => p.tipo === "CICLO_DETECTADO");
    assert.equal(ciclosIndirecto.length, 3);
    assert.deepEqual(
      ciclosIndirecto.map((p) => p.codigo).sort(),
      ["X", "Y", "Z"],
    );

    // Autorreferencia (ciclo directo A -> A)
    const autoCiclo: CursoMalla[] = [
      crearCurso("AUTO", 1, ["AUTO"]),
    ];
    const problemasAuto = validarMalla(autoCiclo);
    const ciclosAuto = problemasAuto.filter((p) => p.tipo === "CICLO_DETECTADO");
    assert.equal(ciclosAuto.length, 1);
    assert.equal(ciclosAuto[0].codigo, "AUTO");
  });

  it("malla oficial de los mocks (MALLA_MOCK) devuelve []", () => {
    const problemas = validarMalla(MALLA_MOCK);
    assert.deepEqual(problemas, []);
  });
});
