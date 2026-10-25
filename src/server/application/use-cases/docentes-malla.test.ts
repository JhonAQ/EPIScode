import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DOCENTES_MOCK } from "@/mocks/docentes";
import { MALLA_MOCK } from "@/mocks/malla";
import { InvalidQueryError } from "@/server/domain/errors";
import { InMemoryDocenteRepository } from "@/server/infrastructure/in-memory/in-memory-docente-repository";
import { InMemoryMallaRepository } from "@/server/infrastructure/in-memory/in-memory-malla-repository";
import { parseDocentesQuery } from "@/server/interface/http/docentes-query";
import { DEFAULT_PAGE_SIZE, ListarDocentes, MAX_PAGE_SIZE } from "./listar-docentes";

const listar = new ListarDocentes(new InMemoryDocenteRepository());

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

  it("busca un curso por código", async () => {
    assert.equal((await repo.findByCodigo("MAT101"))?.nombre, "Matemática I");
    assert.equal(await repo.findByCodigo("NOEXISTE"), null);
  });
});
