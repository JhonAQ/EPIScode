import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { POST } from "@/app/api/colaboraciones/route";
import { getRegistrarColaboracion } from "@/server/composition/container";
import { RegistrarColaboracion } from "@/server/application/use-cases/registrar-colaboracion";
import type { SolicitudColaboracion } from "@/server/domain/solicitud-colaboracion";
import { InMemoryColaboracionRepository } from "@/server/infrastructure/in-memory/in-memory-colaboracion-repository";
import { parseColaboracionRequest } from "./colaboracion-request";

const solicitud = {
  nombre: "Empresa Ejemplo",
  correo: "contacto@example.com",
  tipoInteres: "practicas",
  mensaje: "Nos gustaría ofrecer prácticas.",
};

function request(body: unknown): Request {
  return new Request("http://localhost/api/colaboraciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("solicitudes de colaboración", () => {
  it("el caso de uso guarda solicitudes en memoria", async () => {
    const guardadas: SolicitudColaboracion[] = [];
    const caso = new RegistrarColaboracion(new InMemoryColaboracionRepository(guardadas));
    const valida: SolicitudColaboracion = { ...solicitud, tipoInteres: "practicas" };
    await caso.execute(valida);
    assert.deepEqual(guardadas, [valida]);
  });

  it("acepta los tres intereses y recorta espacios exteriores", () => {
    for (const tipoInteres of ["investigacion", "practicas", "alianzas"]) {
      const resultado = parseColaboracionRequest({ ...solicitud, nombre: "  Empresa  ", tipoInteres });
      assert.equal(resultado.valido, true);
      if (resultado.valido) assert.equal(resultado.solicitud.nombre, "Empresa");
    }
  });

  it("informa todos los campos obligatorios y rechaza tipos incorrectos", () => {
    const resultado = parseColaboracionRequest({ nombre: "  ", correo: 123, mensaje: null });
    assert.equal(resultado.valido, false);
    if (!resultado.valido) {
      assert.deepEqual(Object.keys(resultado.errores).sort(), ["correo", "mensaje", "nombre", "tipoInteres"]);
    }
    assert.equal(parseColaboracionRequest({ ...solicitud, tipoInteres: "otro" }).valido, false);
    assert.equal(parseColaboracionRequest(null).valido, false);
    assert.equal(parseColaboracionRequest([]).valido, false);
  });

  it("valida el correo y los límites acordados", () => {
    for (const correo of ["hola", "nombre@", "a@dominio", "a@@ejemplo.com", "a b@ejemplo.com"]) {
      const resultado = parseColaboracionRequest({ ...solicitud, correo });
      assert.equal(resultado.valido, false, correo);
      if (!resultado.valido) assert.ok(resultado.errores.correo);
    }
    assert.equal(parseColaboracionRequest({ ...solicitud, nombre: "a".repeat(150), mensaje: "a".repeat(2000) }).valido, true);
    const largo = parseColaboracionRequest({
      ...solicitud, nombre: "a".repeat(151), correo: `${"a".repeat(247)}@ejemplo.com`, mensaje: "a".repeat(2001),
    });
    assert.equal(largo.valido, false);
    if (!largo.valido) assert.deepEqual(Object.keys(largo.errores).sort(), ["correo", "mensaje", "nombre"]);
  });

  it("guarda una solicitud válida y responde 201 sin datos personales", async () => {
    const caso = getRegistrarColaboracion();
    const execute = mock.method(caso, "execute", async () => {});
    try {
      const respuesta = await POST(request(solicitud));
      assert.equal(respuesta.status, 201);
      assert.deepEqual(await respuesta.json(), { success: true, data: { mensaje: "Tu solicitud fue recibida." } });
      assert.equal(execute.mock.calls.length, 1);
      assert.deepEqual(execute.mock.calls[0].arguments[0], solicitud);
    } finally {
      execute.mock.restore();
    }
  });

  it("devuelve errores por campo sin guardar datos inválidos", async () => {
    const execute = mock.method(getRegistrarColaboracion(), "execute", async () => {});
    try {
      const respuesta = await POST(request({ ...solicitud, correo: "incorrecto", mensaje: " " }));
      assert.equal(respuesta.status, 400);
      const body = await respuesta.json();
      assert.equal(body.success, false);
      assert.deepEqual(Object.keys(body.errores).sort(), ["correo", "mensaje"]);
      assert.equal(execute.mock.calls.length, 0);
      assert.ok(!JSON.stringify(body).includes(solicitud.nombre));
    } finally {
      execute.mock.restore();
    }
  });

  it("rechaza JSON mal formado y no expone errores internos", async () => {
    const invalido = await POST(new Request("http://localhost/api/colaboraciones", { method: "POST", body: "{" }));
    assert.equal(invalido.status, 400);
    assert.deepEqual((await invalido.json()).errores, { formulario: "Envía un JSON válido." });

    const execute = mock.method(getRegistrarColaboracion(), "execute", async () => { throw new Error("detalle privado"); });
    try {
      const respuesta = await POST(request(solicitud));
      assert.equal(respuesta.status, 500);
      const body = await respuesta.json();
      assert.equal(body.success, false);
      assert.ok(!JSON.stringify(body).includes("detalle privado"));
    } finally {
      execute.mock.restore();
    }
  });
});
