import { DOCENTES_MOCK } from "@/mocks/docentes";
import { MALLA_MOCK, MALLA_VERSIONES_MOCK } from "@/mocks/malla";
import { closePool, getPool } from "@/server/infrastructure/persistence/postgres/pool";

async function main() {
  const vigentes = MALLA_VERSIONES_MOCK.filter((version) => version.vigente);
  if (vigentes.length !== 1) throw new Error("Los mocks deben tener una sola malla vigente.");
  const mallaId = vigentes[0].id;
  // Los identificadores de ejemplo son estables, no equivalencias oficiales entre mallas.
  const cursoIds = new Map(MALLA_MOCK.map((curso) => [curso.codigo, `mock:${curso.codigo}`]));
  if (cursoIds.size !== MALLA_MOCK.length) throw new Error("Hay códigos de curso duplicados en los mocks.");

  function idCurso(codigo: string): string {
    const id = cursoIds.get(codigo);
    if (!id) throw new Error(`El curso ${codigo} no existe en la malla de ejemplo.`);
    return id;
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    // Se guardan las versiones no vigentes antes de la vigente por el índice único.
    for (const version of [...MALLA_VERSIONES_MOCK].sort((a, b) => Number(a.vigente) - Number(b.vigente))) {
      await client.query(
        `INSERT INTO malla_versiones (id, nombre, vigente) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, vigente = EXCLUDED.vigente`,
        [version.id, version.nombre, version.vigente],
      );
    }

    for (const curso of MALLA_MOCK) {
      const id = idCurso(curso.codigo);
      await client.query(
        `INSERT INTO cursos (id, nombre) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre`,
        [id, curso.nombre],
      );
      await client.query(
        `INSERT INTO malla_curso (malla_id, curso_id, codigo, creditos, semestre, tipo, area_formativa)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (malla_id, curso_id) DO UPDATE SET
           codigo = EXCLUDED.codigo, creditos = EXCLUDED.creditos, semestre = EXCLUDED.semestre,
           tipo = EXCLUDED.tipo, area_formativa = EXCLUDED.area_formativa`,
        [mallaId, id, curso.codigo, curso.creditos, curso.semestre, curso.tipo, curso.areaFormativa],
      );
    }

    for (const curso of MALLA_MOCK) {
      for (const codigo of curso.prerrequisitos) {
        await client.query(
          `INSERT INTO prerrequisitos (malla_id, curso_id, prerrequisito_id)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [mallaId, idCurso(curso.codigo), idCurso(codigo)],
        );
      }
    }

    for (const docente of DOCENTES_MOCK) {
      await client.query(
        `INSERT INTO docentes (id, nombre, cargo, grado, correo, foto_url, departamento, especialidades)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           nombre = EXCLUDED.nombre, cargo = EXCLUDED.cargo, grado = EXCLUDED.grado,
           correo = EXCLUDED.correo, foto_url = EXCLUDED.foto_url,
           departamento = EXCLUDED.departamento, especialidades = EXCLUDED.especialidades`,
        [docente.id, docente.nombre, docente.cargo, docente.grado, docente.correo,
          docente.fotoUrl ?? null, docente.departamento, docente.especialidades],
      );
      for (const curso of docente.cursos) {
        await client.query(
          `INSERT INTO docente_curso (docente_id, malla_id, curso_id)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [docente.id, mallaId, idCurso(curso.codigo)],
        );
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error("No se pudo cargar el seed de docentes y malla:", error);
    process.exitCode = 1;
  })
  .finally(closePool);
