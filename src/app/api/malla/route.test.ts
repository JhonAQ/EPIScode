import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MALLA_MOCK } from "@/mocks/malla";
import type { ApiResponse, Malla } from "@/types";
import { GET } from "./route";

describe("GET /api/malla", () => {
  it("sin filtros devuelve 200 con la malla de la versión vigente y los totales completos", async () => {
    const req = new Request("http://localhost:3000/api/malla");
    const res = await GET(req);
    assert.equal(res.status, 200);

    const body = (await res.json()) as ApiResponse<Malla>;
    assert.equal(body.success, true);
    assert.ok(body.data);
    assert.equal(body.data.version.id, "malla-2017");
    assert.equal(body.data.version.vigente, true);
    assert.equal(body.data.totalAsignaturas, MALLA_MOCK.length);
    assert.equal(body.data.totalCreditos, MALLA_MOCK.reduce((sum, c) => sum + c.creditos, 0));
    assert.equal(body.data.totalSemestres, 10);
    assert.equal(body.data.cursos.length, MALLA_MOCK.length);
  });

  it("con filtros devuelve 200, cursos filtrados y totales correspondientes a la versión completa", async () => {
    const req = new Request("http://localhost:3000/api/malla?semestre=1&tipo=Núcleo");
    const res = await GET(req);
    assert.equal(res.status, 200);

    const body = (await res.json()) as ApiResponse<Malla>;
    assert.equal(body.success, true);
    assert.ok(body.data);
    // Cursos filtrados
    assert.deepEqual(
      body.data.cursos.map((c) => c.codigo),
      ["PRG101"],
    );
    // Totales deben ser los de la versión completa (no de los cursos filtrados)
    assert.equal(body.data.totalAsignaturas, MALLA_MOCK.length);
    assert.equal(body.data.totalCreditos, MALLA_MOCK.reduce((sum, c) => sum + c.creditos, 0));
    assert.equal(body.data.totalSemestres, 10);
  });

  it("con búsqueda por texto q devuelve 200 y filtra por nombre o código", async () => {
    const req = new Request("http://localhost:3000/api/malla?q=matematica");
    const res = await GET(req);
    assert.equal(res.status, 200);

    const body = (await res.json()) as ApiResponse<Malla>;
    assert.equal(body.success, true);
    assert.ok(body.data);
    assert.ok(body.data.cursos.length > 0);
    assert.ok(
      body.data.cursos.every(
        (c) =>
          c.nombre.toLowerCase().includes("matemática") ||
          c.codigo.toLowerCase().includes("mat"),
      ),
    );
  });

  it("devuelve 400 si semestre=11", async () => {
    const req = new Request("http://localhost:3000/api/malla?semestre=11");
    const res = await GET(req);
    assert.equal(res.status, 400);

    const body = (await res.json()) as ApiResponse<Malla>;
    assert.equal(body.success, false);
    assert.match(body.error ?? "", /semestre/i);
  });

  it("devuelve 400 si tipo es desconocido", async () => {
    const req = new Request("http://localhost:3000/api/malla?tipo=Desconocido");
    const res = await GET(req);
    assert.equal(res.status, 400);

    const body = (await res.json()) as ApiResponse<Malla>;
    assert.equal(body.success, false);
    assert.match(body.error ?? "", /tipo/i);
  });

  it("devuelve 400 si areaFormativa es desconocida", async () => {
    const req = new Request("http://localhost:3000/api/malla?areaFormativa=Inexistente");
    const res = await GET(req);
    assert.equal(res.status, 400);

    const body = (await res.json()) as ApiResponse<Malla>;
    assert.equal(body.success, false);
    assert.match(body.error ?? "", /areaFormativa/i);
  });

  it("devuelve 400 si version no existe", async () => {
    const req = new Request("http://localhost:3000/api/malla?version=malla-9999");
    const res = await GET(req);
    assert.equal(res.status, 400);

    const body = (await res.json()) as ApiResponse<Malla>;
    assert.equal(body.success, false);
    assert.match(body.error ?? "", /versión/i);
  });
});
