import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GET } from "./route";

describe("GET /api/docentes/[id]", () => {
  it("devuelve 200 con los datos del docente si existe", async () => {
    const request = new Request("http://localhost:3000/api/docentes/doc-001");
    const response = await GET(request, {
      params: Promise.resolve({ id: "doc-001" }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.data?.id, "doc-001");
    assert.equal(body.data?.departamento, "Ingeniería de Sistemas");
    assert.equal(body.data?.grado, "Doctor en Ciencias de la Computación");
    assert.ok(Array.isArray(body.data?.cursos) && body.data.cursos.length > 0);
    for (const curso of body.data.cursos) {
      assert.ok(curso.codigo);
      assert.ok(curso.nombre);
    }
  });

  it("devuelve 404 si el docente no existe", async () => {
    const request = new Request("http://localhost:3000/api/docentes/doc-999");
    const response = await GET(request, {
      params: Promise.resolve({ id: "doc-999" }),
    });

    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error, "Docente no encontrado.");
  });

  it("devuelve 400 si el identificador está vacío o compuesto por espacios", async () => {
    const request = new Request("http://localhost:3000/api/docentes/%20%20%20");
    const response = await GET(request, {
      params: Promise.resolve({ id: "   " }),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error, "El identificador del docente es obligatorio.");
  });
});
