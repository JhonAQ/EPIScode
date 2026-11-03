import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MallaVersion } from "@/types";
import { InMemoryMallaRepository } from "@/server/infrastructure/in-memory/in-memory-malla-repository";
import { ListarVersionesMalla } from "./listar-versiones-malla";

describe("ListarVersionesMalla", () => {
  it("devuelve las versiones con la vigente primero cuando ya está primero", async () => {
    const versionesMock: MallaVersion[] = [
      { id: "malla-2017", nombre: "Malla 2017", vigente: true },
      { id: "malla-2010", nombre: "Malla 2010", vigente: false },
    ];
    const repo = new InMemoryMallaRepository([], versionesMock);
    const useCase = new ListarVersionesMalla(repo);

    const res = await useCase.execute();

    assert.equal(res.length, 2);
    assert.equal(res[0].id, "malla-2017");
    assert.equal(res[0].vigente, true);
    assert.equal(res[1].id, "malla-2010");
    assert.equal(res[1].vigente, false);
  });

  it("ubica la versión vigente primero cuando no está primera en el origen", async () => {
    const versionesMock: MallaVersion[] = [
      { id: "malla-2010", nombre: "Malla 2010", vigente: false },
      { id: "malla-2005", nombre: "Malla 2005", vigente: false },
      { id: "malla-2017", nombre: "Malla 2017", vigente: true },
    ];
    const repo = new InMemoryMallaRepository([], versionesMock);
    const useCase = new ListarVersionesMalla(repo);

    const res = await useCase.execute();

    assert.equal(res.length, 3);
    assert.equal(res[0].id, "malla-2017");
    assert.equal(res[0].vigente, true);
    assert.equal(res[1].id, "malla-2010");
    assert.equal(res[2].id, "malla-2005");
  });

  it("lanza un error si ninguna versión es vigente (0 versiones vigentes)", async () => {
    const versionesMock: MallaVersion[] = [
      { id: "malla-2010", nombre: "Malla 2010", vigente: false },
      { id: "malla-2005", nombre: "Malla 2005", vigente: false },
    ];
    const repo = new InMemoryMallaRepository([], versionesMock);
    const useCase = new ListarVersionesMalla(repo);

    await assert.rejects(
      useCase.execute(),
      /Debe existir exactamente una versión vigente de la malla curricular./,
    );
  });

  it("lanza un error si más de una versión es vigente (> 1 versiones vigentes)", async () => {
    const versionesMock: MallaVersion[] = [
      { id: "malla-2017", nombre: "Malla 2017", vigente: true },
      { id: "malla-2024", nombre: "Malla 2024", vigente: true },
    ];
    const repo = new InMemoryMallaRepository([], versionesMock);
    const useCase = new ListarVersionesMalla(repo);

    await assert.rejects(
      useCase.execute(),
      /Debe existir exactamente una versión vigente de la malla curricular./,
    );
  });
});
