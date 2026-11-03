import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { it } from "node:test";
import { Pool } from "pg";
import { ListarDocentes } from "@/server/application/use-cases/listar-docentes";
import { PgDocenteRepository } from "./pg-docente-repository";
import { PgMallaRepository } from "./pg-malla-repository";

it("repositorios PostgreSQL consultan datos aislados con filtros y relaciones", { skip: process.env.RUN_DB_TESTS !== "1" }, async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL es necesaria para las pruebas PostgreSQL");
  const esquema = `test_${randomUUID().replaceAll("-", "")}`;
  const admin = new Pool({ connectionString: process.env.DATABASE_URL });
  let db: Pool | undefined;
  try {
    await admin.query(`CREATE SCHEMA "${esquema}"`);
    db = new Pool({ connectionString: process.env.DATABASE_URL, options: `-c search_path=${esquema}` });
    await db.query(await readFile("db/init/02-docentes-malla.sql", "utf8"));
    await db.query(`
      INSERT INTO malla_versiones VALUES ('v1', 'Malla vigente', true), ('v2', 'Malla anterior', false);
      INSERT INTO cursos VALUES ('c1', 'Matemática Básica'), ('c2', 'Redes'), ('c3', 'Matemática histórica');
      INSERT INTO malla_curso VALUES
        ('v1', 'c1', 'MAT1', 4, 1, 'Núcleo', 'Computación'),
        ('v1', 'c2', 'RED2', 3, 2, 'Obligatorio', 'Redes y Sistemas'),
        ('v2', 'c3', 'MAT1', 3, 1, 'General', 'Ciencias Básicas');
      INSERT INTO prerrequisitos VALUES ('v1', 'c2', 'c1');
      INSERT INTO docentes (id, nombre, cargo, grado, correo, departamento, especialidades) VALUES
        ('d1', 'Lucía', 'Principal', 'Doctora', 'lucia@example.edu', 'Ciencias Básicas', ARRAY['Redes', 'Seguridad']),
        ('d2', 'Marta', 'Asociada', 'Magíster', 'marta@example.edu', 'Ciencias Básicas', ARRAY['Redes']),
        ('d3', 'Ana', 'Principal', 'Doctora', 'ana@example.edu', 'Ingeniería', ARRAY['Software']);
      INSERT INTO docente_curso VALUES ('d1', 'v1', 'c1'), ('d1', 'v1', 'c2'), ('d2', 'v1', 'c2');
    `);

    const docentes = new PgDocenteRepository(db);
    const listar = new ListarDocentes(docentes);
    const malla = new PgMallaRepository(db);

    const pagina = await listar.execute({ departamento: "ciencias basicas", especialidad: "redes", page: 2, pageSize: 1 });
    assert.equal(pagina.total, 2);
    assert.equal(pagina.totalPages, 2);
    assert.deepEqual(pagina.items.map((docente) => docente.id), ["d2"]);
    assert.equal((await listar.execute({ page: 99 })).total, 3);
    assert.deepEqual((await listar.execute({ q: "matematica basica" })).items.map((d) => d.id), ["d1"]);
    assert.deepEqual((await listar.execute({ q: "seguridad" })).items.map((d) => d.id), ["d1"]);
    assert.deepEqual((await listar.execute({ q: "LUCIA" })).items.map((d) => d.id), ["d1"]);
    assert.deepEqual((await listar.execute({ departamento: "Ingeniería", especialidad: "Redes" })).items, []);
    assert.deepEqual((await listar.execute({ q: "%" })).items, []);
    assert.equal((await docentes.findById("d1"))?.cursos[0].nombre, "Matemática Básica");
    assert.equal(await docentes.findById("' OR true --"), null);
    assert.deepEqual(await docentes.listarFiltros(), {
      departamentos: ["Ciencias Básicas", "Ingeniería"],
      especialidades: ["Redes", "Seguridad", "Software"],
    });

    assert.deepEqual((await malla.findAll({})).map((curso) => curso.codigo), ["MAT1", "RED2"]);
    assert.deepEqual((await malla.findAll({ semestre: 2, tipo: "Obligatorio" }))[0].prerrequisitos, ["MAT1"]);
    assert.deepEqual((await malla.findAll({ areaFormativa: "Computación" })).map((c) => c.codigo), ["MAT1"]);
    assert.equal((await malla.findAll({ q: "matematica" }))[0].nombre, "Matemática Básica");
    assert.equal((await malla.findAll({ q: "red2" }))[0].nombre, "Redes");
    assert.equal((await malla.findAll({ version: "v2" }))[0].nombre, "Matemática histórica");
    assert.deepEqual(await malla.findAll({ version: "inexistente" }), []);
    assert.equal((await malla.findByCodigo("MAT1"))?.nombre, "Matemática Básica");
    assert.equal(await malla.findByCodigo("' OR true --"), null);
  } finally {
    await db?.end();
    await admin.query(`DROP SCHEMA IF EXISTS "${esquema}" CASCADE`);
    await admin.end();
  }
});
