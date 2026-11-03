import type { Pool } from "pg";
import type { DocenteFilter, DocenteRepository, FiltrosDocentes, PageRequest } from "@/server/application/ports/docente-repository";
import { normalizarTexto } from "@/server/domain/services/normalizar-texto";
import type { CursoResumen, Docente, Paginado } from "@/types";
import { getPool } from "./pool";

interface DocenteRow {
  id: string;
  nombre: string;
  cargo: string;
  grado: string;
  correo: string;
  foto_url: string | null;
  departamento: string;
  especialidades: string[];
  cursos: CursoResumen[];
}

// Equivale a normalizarTexto: minúsculas, sin tildes y sin espacios exteriores.
function normalizarSql(expresion: string): string {
  return `trim(regexp_replace(normalize(lower(${expresion}), NFD), U&'[\\0300-\\036F]', '', 'g'))`;
}

const cursosSql = `COALESCE((
  SELECT json_agg(json_build_object('codigo', mc.codigo, 'nombre', c.nombre) ORDER BY mc.codigo)
  FROM docente_curso dc
  JOIN malla_versiones mv ON mv.id = dc.malla_id AND mv.vigente
  JOIN malla_curso mc ON (mc.malla_id, mc.curso_id) = (dc.malla_id, dc.curso_id)
  JOIN cursos c ON c.id = mc.curso_id
  WHERE dc.docente_id = d.id
), '[]'::json)`;

const filtrosSql = `
  ($1::text IS NULL OR ${normalizarSql("d.departamento")} = $1)
  AND ($2::text IS NULL OR EXISTS (
    SELECT 1 FROM unnest(d.especialidades) AS e(valor) WHERE ${normalizarSql("e.valor")} = $2
  ))
  AND ($3::text IS NULL OR strpos(${normalizarSql(`concat_ws(' ', d.nombre, array_to_string(d.especialidades, ' '),
    COALESCE((SELECT string_agg(c.nombre, ' ' ORDER BY mc.codigo)
      FROM docente_curso dc
      JOIN malla_versiones mv ON mv.id = dc.malla_id AND mv.vigente
      JOIN malla_curso mc ON (mc.malla_id, mc.curso_id) = (dc.malla_id, dc.curso_id)
      JOIN cursos c ON c.id = mc.curso_id WHERE dc.docente_id = d.id), ''))`)}, $3) > 0)`;

function aDocente(row: DocenteRow): Docente {
  return {
    id: row.id, nombre: row.nombre, cargo: row.cargo, grado: row.grado, correo: row.correo,
    ...(row.foto_url === null ? {} : { fotoUrl: row.foto_url }),
    departamento: row.departamento, especialidades: row.especialidades, cursos: row.cursos,
  };
}

export class PgDocenteRepository implements DocenteRepository {
  constructor(private readonly pool?: Pool) {}

  private get db(): Pool { return this.pool ?? getPool(); }

  async search(filter: DocenteFilter, { page, pageSize }: PageRequest): Promise<Paginado<Docente>> {
    const parametros = [filter.departamento, filter.especialidad, filter.q].map(
      (valor) => valor ? normalizarTexto(valor) : null,
    );
    const totalResult = await this.db.query<{ total: string }>(
      `SELECT count(*) AS total FROM docentes d WHERE ${filtrosSql}`, parametros,
    );
    const total = Number(totalResult.rows[0].total);
    const result = await this.db.query<DocenteRow>(
      `SELECT d.*, ${cursosSql} AS cursos FROM docentes d WHERE ${filtrosSql}
       ORDER BY d.id LIMIT $4 OFFSET $5`,
      [...parametros, pageSize, (page - 1) * pageSize],
    );
    return { items: result.rows.map(aDocente), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string): Promise<Docente | null> {
    const result = await this.db.query<DocenteRow>(
      `SELECT d.*, ${cursosSql} AS cursos FROM docentes d WHERE d.id = $1`, [id],
    );
    return result.rows[0] ? aDocente(result.rows[0]) : null;
  }

  async listarFiltros(): Promise<FiltrosDocentes> {
    const departamentos = await this.db.query<{ valor: string }>("SELECT DISTINCT departamento AS valor FROM docentes");
    const especialidades = await this.db.query<{ valor: string }>(
      "SELECT DISTINCT e.valor FROM docentes d CROSS JOIN LATERAL unnest(d.especialidades) AS e(valor)",
    );
    const ordenar = (a: string, b: string) => a.localeCompare(b, "es");
    return {
      departamentos: departamentos.rows.map((row) => row.valor).sort(ordenar),
      especialidades: especialidades.rows.map((row) => row.valor).sort(ordenar),
    };
  }
}
