import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getListarVersionesMalla } from "@/server/composition/container";
import type { ApiResponse, MallaVersion } from "@/types";
import { GET } from "./route";

describe("GET /api/malla/versiones", () => {
  it("devuelve 200, success: true, array de versiones con exactamente una vigente y la vigente primera", async () => {
    const response = await GET();

    assert.equal(response.status, 200);
    const body = (await response.json()) as ApiResponse<MallaVersion[]>;

    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);

    const vigentes = body.data.filter((v) => v.vigente);
    assert.equal(vigentes.length, 1);
    assert.equal(body.data[0].vigente, true);
  });

  it("devuelve 500 si el caso de uso falla", async () => {
    const useCase = getListarVersionesMalla();
    const originalExecute = useCase.execute;
    useCase.execute = async () => {
      throw new Error("Simulated failure");
    };

    const originalError = console.error;
    console.error = () => {};

    try {
      const response = await GET();
      assert.equal(response.status, 500);

      const body = (await response.json()) as ApiResponse<MallaVersion[]>;
      assert.equal(body.success, false);
      assert.equal(
        body.error,
        "No se pudieron obtener las versiones de la malla curricular. Intenta de nuevo.",
      );
    } finally {
      useCase.execute = originalExecute;
      console.error = originalError;
    }
  });
});
