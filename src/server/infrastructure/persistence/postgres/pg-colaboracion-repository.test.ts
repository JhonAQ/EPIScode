import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { it, mock } from "node:test";
import { Pool } from "pg";
import type { QueryResult } from "pg";
import { POST } from "@/app/api/colaboraciones/route";
import { RegistrarColaboracion } from "@/server/application/use-cases/registrar-colaboracion";
import { getRegistrarColaboracion } from "@/server/composition/container";
import { TIPOS_INTERES } from "@/server/domain/solicitud-colaboracion";
import type { SolicitudColaboracion } from "@/server/domain/solicitud-colaboracion";
import { PgColaboracionRepository } from "./pg-colaboracion-repository";

it("persiste colaboraciones y conserva el contrato HTTP", { skip: process.env.RUN_DB_TESTS !== "1" }, async () => {
  const connectionString = process.env.DATABASE_URL;
  assert.ok(connectionString, "Configura DATABASE_URL para ejecutar las pruebas PostgreSQL.");
  const esquema = `test_colaboracion_${randomUUID().replaceAll("-", "")}`;
  const admin = new Pool({ connectionString });
  let db: Pool | undefined;
  let lector: Pool | undefined;
  let creado = false;
  try {
    await admin.query(`CREATE SCHEMA "${esquema}"`);
    creado = true;
    const opciones = { connectionString, options: `-c search_path=${esquema}` };
    db = new Pool(opciones);
    await db.query(await readFile("db/init/03-colaboraciones.sql", "utf8"));

    const caso = new RegistrarColaboracion(new PgColaboracionRepository(db));
    // La ruta utiliza el caso real con el repositorio conectado al esquema aislado.
    const execute = mock.method(getRegistrarColaboracion(), "execute", (solicitud: SolicitudColaboracion) => caso.execute(solicitud));
    try {
      for (const tipoInteres of TIPOS_INTERES) {
        const respuesta = await POST(new Request("http://localhost/api/colaboraciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: "Empresa Ejemplo", correo: "contacto@example.com", tipoInteres, mensaje: "Propuesta de colaboración" }),
        }));
        assert.equal(respuesta.status, 201);
        assert.deepEqual(await respuesta.json(), { success: true, data: { mensaje: "Tu solicitud fue recibida." } });
      }

      const invalida = await POST(new Request("http://localhost/api/colaboraciones", {
        method: "POST", body: JSON.stringify({ nombre: "Empresa", correo: "invalido", tipoInteres: "otro", mensaje: "" }),
      }));
      assert.equal(invalida.status, 400);
      const error = await invalida.json();
      assert.deepEqual(Object.keys(error.errores).sort(), ["correo", "mensaje", "tipoInteres"]);

      // Otra conexión comprueba que las inserciones realmente quedaron guardadas.
      lector = new Pool(opciones);
      const filas = await lector.query<{
        id: string; nombre: string; correo: string; tipo_interes: string; mensaje: string; estado: string; fecha_recepcion: Date;
      }>("SELECT * FROM solicitudes_colaboracion ORDER BY id");
      assert.equal(filas.rowCount, 3);
      assert.deepEqual(filas.rows.map((fila) => fila.tipo_interes), [...TIPOS_INTERES]);
      assert.equal(new Set(filas.rows.map((fila) => fila.id)).size, 3);
      for (const fila of filas.rows) {
        assert.equal(fila.nombre, "Empresa Ejemplo");
        assert.equal(fila.correo, "contacto@example.com");
        assert.equal(fila.mensaje, "Propuesta de colaboración");
        assert.equal(fila.estado, "nueva");
        assert.ok(fila.fecha_recepcion instanceof Date);
      }

      for (const estado of ["en revisión", "atendida"]) {
        const actualizada: QueryResult = await db.query("UPDATE solicitudes_colaboracion SET estado = $1 WHERE id = $2", [estado, filas.rows[0].id]);
        assert.equal(actualizada.rowCount, 1);
      }
      await assert.rejects(db.query("UPDATE solicitudes_colaboracion SET estado = $1", ["desconocido"]));
      await db.query("DROP TABLE solicitudes_colaboracion");
      const fallo = await POST(new Request("http://localhost/api/colaboraciones", {
        method: "POST",
        body: JSON.stringify({ nombre: "Empresa", correo: "contacto@example.com", tipoInteres: "alianzas", mensaje: "Propuesta" }),
      }));
      assert.equal(fallo.status, 500);
      assert.deepEqual(await fallo.json(), { success: false, error: "No se pudo registrar tu solicitud. Intenta de nuevo." });
    } finally {
      execute.mock.restore();
    }
  } finally {
    await lector?.end();
    await db?.end();
    if (creado) await admin.query(`DROP SCHEMA "${esquema}" CASCADE`);
    await admin.end();
  }
});
