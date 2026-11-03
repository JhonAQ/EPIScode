import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { GET } from "@/app/api/docentes/filtros/route";
import { DOCENTES_MOCK } from "@/mocks/docentes";
import { docenteRepository } from "@/server/composition/container";
import { InMemoryDocenteRepository } from "@/server/infrastructure/in-memory/in-memory-docente-repository";
import { ListarFiltrosDocentes } from "./listar-filtros-docentes";

describe("ListarFiltrosDocentes", () => {
  it("elimina departamentos y especialidades repetidos y los ordena en español", async () => {
    const docentes = [
      { ...DOCENTES_MOCK[0], departamento: "Ingeniería", especialidades: ["Redes", "Álgebra"] },
      { ...DOCENTES_MOCK[1], departamento: "Ciencias", especialidades: ["Redes", "Bases de datos"] },
      { ...DOCENTES_MOCK[2], departamento: "Ingeniería", especialidades: ["Álgebra"] },
    ];
    const listar = new ListarFiltrosDocentes(new InMemoryDocenteRepository(docentes));

    assert.deepEqual(await listar.execute(), {
      departamentos: ["Ciencias", "Ingeniería"],
      especialidades: ["Álgebra", "Bases de datos", "Redes"],
    });
  });

  it("devuelve listas vacías si no hay docentes", async () => {
    const listar = new ListarFiltrosDocentes(new InMemoryDocenteRepository([]));
    assert.deepEqual(await listar.execute(), { departamentos: [], especialidades: [] });
  });

  it("la ruta devuelve las opciones en ApiResponse", async () => {
    const opciones = { departamentos: ["Ciencias Básicas"], especialidades: ["Física"] };
    const listarFiltros = mock.method(docenteRepository, "listarFiltros", async () => opciones);
    try {
      const response = await GET();
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { success: true, data: opciones });
    } finally {
      listarFiltros.mock.restore();
    }
  });
});
