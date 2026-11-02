import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DOCENTES_MOCK } from "@/mocks/docentes";
import { MALLA_MOCK } from "@/mocks/malla";
import { InvalidQueryError } from "@/server/domain/errors";
import { InMemoryDocenteRepository } from "@/server/infrastructure/in-memory/in-memory-docente-repository";
import { InMemoryMallaRepository } from "@/server/infrastructure/in-memory/in-memory-malla-repository";
import { parseDocentesQuery } from "@/server/interface/http/docentes-query";
import { parseMallaQuery } from "@/server/interface/http/malla-query";
import type { AreaFormativa, Semestre, TipoCurso } from "@/types";
import { DEFAULT_PAGE_SIZE, ListarDocentes, MAX_PAGE_SIZE } from "./listar-docentes";
import { ListarMalla } from "./listar-malla";

const listar = new ListarDocentes(new InMemoryDocenteRepository());
const listarMalla = new ListarMalla(new InMemoryMallaRepository());

describe("mocks", () => {
  it("la malla es coherente: códigos únicos y prerrequisitos de semestres anteriores", () => {
    const porCodigo = new Map(MALLA_MOCK.map((c) => [c.codigo, c]));
    assert.equal(porCodigo.size, MALLA_MOCK.length);
    for (const curso of MALLA_MOCK) {
      for (const codigo of curso.prerrequisitos) {
        const prerrequisito = porCodigo.get(codigo);
        assert.ok(prerrequisito, `${curso.codigo} exige ${codigo}, que no existe`);
        assert.ok(prerrequisito.semestre < curso.semestre, `${codigo} debe ser de un semestre anterior a ${curso.codigo}`);
      }
    }
  });

  it("los docentes dictan cursos que existen y tienen id único", () => {
    const codigos = new Set(MALLA_MOCK.map((c) => c.codigo));
    assert.equal(new Set(DOCENTES_MOCK.map((d) => d.id)).size, DOCENTES_MOCK.length);
    for (const docente of DOCENTES_MOCK) {
      assert.ok(docente.cursos.every((c) => codigos.has(c.codigo)));
    }
  });
});

describe("ListarDocentes", () => {
  it("sin filtros devuelve la primera página con el total", async () => {
    const res = await listar.execute({});
    assert.equal(res.total, DOCENTES_MOCK.length);
    assert.equal(res.page, 1);
    assert.equal(res.pageSize, DEFAULT_PAGE_SIZE);
    assert.equal(res.items.length, DOCENTES_MOCK.length);
    assert.equal(res.totalPages, 1);
  });

  it("pagina y calcula totalPages", async () => {
    const res = await listar.execute({ page: 2, pageSize: 3 });
    assert.equal(res.items.length, 3);
    assert.equal(res.items[0].id, DOCENTES_MOCK[3].id);
    assert.equal(res.total, DOCENTES_MOCK.length);
    assert.equal(res.totalPages, Math.ceil(DOCENTES_MOCK.length / 3));
  });

  it("una página fuera de rango devuelve items vacíos pero conserva el total", async () => {
    const res = await listar.execute({ page: 99 });
    assert.deepEqual(res.items, []);
    assert.equal(res.total, DOCENTES_MOCK.length);
  });

  it("filtra por departamento ignorando mayúsculas y tildes", async () => {
    const res = await listar.execute({ departamento: "ciencias basicas" });
    assert.deepEqual(res.items.map((d) => d.id), ["doc-006", "doc-007"]);
  });

  it("filtra por especialidad exacta", async () => {
    const res = await listar.execute({ especialidad: "Redes" });
    assert.deepEqual(res.items.map((d) => d.id), ["doc-003"]);
  });

  it("busca texto libre en nombre, especialidad y cursos", async () => {
    assert.deepEqual((await listar.execute({ q: "lucia" })).items.map((d) => d.id), ["doc-002"]);
    assert.deepEqual((await listar.execute({ q: "ciberseguridad" })).items.map((d) => d.id), ["doc-003"]);
    assert.deepEqual((await listar.execute({ q: "aprendizaje automatico" })).items.map((d) => d.id), ["doc-001"]);
  });

  it("combina filtros con AND", async () => {
    const res = await listar.execute({ departamento: "Ciencias Básicas", q: "física" });
    assert.deepEqual(res.items.map((d) => d.id), ["doc-007"]);
  });

  it("rechaza page y pageSize inválidos", async () => {
    await assert.rejects(listar.execute({ page: 0 }), InvalidQueryError);
    await assert.rejects(listar.execute({ page: 1.5 }), InvalidQueryError);
    await assert.rejects(listar.execute({ pageSize: 0 }), InvalidQueryError);
    await assert.rejects(listar.execute({ pageSize: MAX_PAGE_SIZE + 1 }), InvalidQueryError);
  });
});

describe("parseDocentesQuery", () => {
  it("convierte la query string y descarta vacíos", () => {
    const query = parseDocentesQuery(new URLSearchParams("q=%20redes%20&departamento=&page=2&pageSize=5"));
    assert.deepEqual(query, {
      q: "redes",
      departamento: undefined,
      especialidad: undefined,
      page: 2,
      pageSize: 5,
    });
  });

  it("rechaza números mal formados", () => {
    assert.throws(() => parseDocentesQuery(new URLSearchParams("page=abc")), InvalidQueryError);
    assert.throws(() => parseDocentesQuery(new URLSearchParams("pageSize=2.5")), InvalidQueryError);
  });
});

describe("InMemoryMallaRepository", () => {
  const repo = new InMemoryMallaRepository();

  it("sin filtros devuelve toda la malla ordenada por semestre", async () => {
    const cursos = await repo.findAll({});
    assert.equal(cursos.length, MALLA_MOCK.length);
    assert.ok(cursos.every((c, i) => i === 0 || cursos[i - 1].semestre <= c.semestre));
  });

  it("combina filtros por semestre, tipo y área", async () => {
    const cursos = await repo.findAll({ semestre: 1, tipo: "Núcleo" });
    assert.deepEqual(cursos.map((c) => c.codigo), ["PRG101"]);
    assert.ok((await repo.findAll({ areaFormativa: "Redes y Sistemas" })).every((c) => c.areaFormativa === "Redes y Sistemas"));
  });

  it("busca por texto libre q en nombre o código", async () => {
    const porNombre = await repo.findAll({ q: "matemática" });
    assert.ok(porNombre.length >= 3);
    assert.ok(porNombre.every((c) => c.nombre.includes("Matemática")));

    const porCodigo = await repo.findAll({ q: "prg10" });
    assert.deepEqual(porCodigo.map((c) => c.codigo), ["PRG101", "PRG102"]);
  });

  it("busca un curso por código", async () => {
    assert.equal((await repo.findByCodigo("MAT101"))?.nombre, "Matemática I");
    assert.equal(await repo.findByCodigo("NOEXISTE"), null);
  });
});

describe("parseMallaQuery", () => {
  it("convierte la query string válida y descarta vacíos", () => {
    const query = parseMallaQuery(
      new URLSearchParams("version=%20malla-2017%20&areaFormativa=Computación&semestre=2&tipo=Núcleo&q=%20poo%20"),
    );
    assert.deepEqual(query, {
      version: "malla-2017",
      areaFormativa: "Computación",
      semestre: 2,
      tipo: "Núcleo",
      q: "poo",
    });
  });

  it("rechaza semestre inválido (11, 0, no entero o texto)", () => {
    assert.throws(() => parseMallaQuery(new URLSearchParams("semestre=11")), InvalidQueryError);
    assert.throws(() => parseMallaQuery(new URLSearchParams("semestre=0")), InvalidQueryError);
    assert.throws(() => parseMallaQuery(new URLSearchParams("semestre=2.5")), InvalidQueryError);
    assert.throws(() => parseMallaQuery(new URLSearchParams("semestre=abc")), InvalidQueryError);
  });

  it("rechaza tipo desconocido", () => {
    assert.throws(() => parseMallaQuery(new URLSearchParams("tipo=desconocido")), InvalidQueryError);
    assert.throws(() => parseMallaQuery(new URLSearchParams("tipo=Electivo")), InvalidQueryError);
  });

  it("rechaza areaFormativa desconocida", () => {
    assert.throws(() => parseMallaQuery(new URLSearchParams("areaFormativa=Artes")), InvalidQueryError);
  });
});

describe("ListarMalla", () => {
  it("sin filtros devuelve la versión vigente por defecto con totales completos", async () => {
    const res = await listarMalla.execute({});
    assert.equal(res.version.id, "malla-2017");
    assert.equal(res.version.vigente, true);
    assert.equal(res.totalAsignaturas, MALLA_MOCK.length);
    assert.equal(res.totalCreditos, MALLA_MOCK.reduce((sum, c) => sum + c.creditos, 0));
    assert.equal(res.totalSemestres, 10);
    assert.equal(res.cursos.length, MALLA_MOCK.length);
    // Cursos ordenados por semestre
    assert.ok(res.cursos.every((c, i) => i === 0 || res.cursos[i - 1].semestre <= c.semestre));
  });

  it("filtro por version: devuelve la versión solicitada", async () => {
    const res = await listarMalla.execute({ version: "malla-2010" });
    assert.equal(res.version.id, "malla-2010");
    assert.equal(res.version.vigente, false);
  });

  it("filtro por areaFormativa", async () => {
    const res = await listarMalla.execute({ areaFormativa: "Ciencias Básicas" });
    assert.ok(res.cursos.length > 0);
    assert.ok(res.cursos.every((c) => c.areaFormativa === "Ciencias Básicas"));
    // Totales se mantienen completos
    assert.equal(res.totalAsignaturas, MALLA_MOCK.length);
  });

  it("filtro por semestre", async () => {
    const res = await listarMalla.execute({ semestre: 1 });
    assert.ok(res.cursos.length > 0);
    assert.ok(res.cursos.every((c) => c.semestre === 1));
    // Totales se mantienen completos
    assert.equal(res.totalAsignaturas, MALLA_MOCK.length);
  });

  it("filtro por tipo", async () => {
    const res = await listarMalla.execute({ tipo: "General" });
    assert.ok(res.cursos.length > 0);
    assert.ok(res.cursos.every((c) => c.tipo === "General"));
    // Totales se mantienen completos
    assert.equal(res.totalAsignaturas, MALLA_MOCK.length);
  });

  it("filtro por texto q (nombre o código)", async () => {
    const res = await listarMalla.execute({ q: "PRG101" });
    assert.equal(res.cursos.length, 1);
    assert.equal(res.cursos[0].codigo, "PRG101");

    const resNombre = await listarMalla.execute({ q: "algoritmos" });
    assert.ok(resNombre.cursos.length > 0);
    assert.ok(resNombre.cursos.some((c) => c.codigo === "ALG301"));
  });

  it("filtro combinado: aplica todos los criterios con AND y conserva totales completos", async () => {
    const res = await listarMalla.execute({
      semestre: 1,
      tipo: "Núcleo",
      areaFormativa: "Computación",
      q: "programación",
    });
    assert.equal(res.cursos.length, 1);
    assert.equal(res.cursos[0].codigo, "PRG101");

    // Totales corresponden a la versión completa, no a lo filtrado
    assert.equal(res.totalAsignaturas, MALLA_MOCK.length);
    assert.equal(res.totalCreditos, MALLA_MOCK.reduce((sum, c) => sum + c.creditos, 0));
    assert.equal(res.totalSemestres, 10);
  });

  it("rechaza valores inválidos con InvalidQueryError", async () => {
    await assert.rejects(listarMalla.execute({ semestre: 11 as Semestre }), InvalidQueryError);
    await assert.rejects(listarMalla.execute({ semestre: 0 as Semestre }), InvalidQueryError);
    await assert.rejects(listarMalla.execute({ tipo: "Invalido" as TipoCurso }), InvalidQueryError);
    await assert.rejects(listarMalla.execute({ areaFormativa: "Invalida" as AreaFormativa }), InvalidQueryError);
    await assert.rejects(listarMalla.execute({ version: "malla-inexistente" }), InvalidQueryError);
  });
});
