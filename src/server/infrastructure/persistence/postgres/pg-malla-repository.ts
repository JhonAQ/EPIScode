import type { Pool } from "pg";
import type { MallaRepository } from "@/server/application/ports/malla-repository";
import { normalizarTexto } from "@/server/domain/services/normalizar-texto";
import type { CursoMalla, MallaQuery } from "@/types";
import { getPool } from "./pool";

interface CursoRow {
  codigo: string;
  nombre: string;
  creditos: number;
  semestre: CursoMalla["semestre"];
  tipo: CursoMalla["tipo"];
  area_formativa: CursoMalla["areaFormativa"];
  prerrequisitos: string[];
}

const camposSql = `mc.codigo, c.nombre, mc.creditos, mc.semestre, mc.tipo, mc.area_formativa,
  ARRAY(SELECT requisito.codigo FROM prerrequisitos p
    JOIN malla_curso requisito ON requisito.malla_id = p.malla_id AND requisito.curso_id = p.prerrequisito_id
    WHERE p.malla_id = mc.malla_id AND p.curso_id = mc.curso_id ORDER BY requisito.codigo) AS prerrequisitos`;

function aCurso(row: CursoRow): CursoMalla {
  return {
    codigo: row.codigo, nombre: row.nombre, creditos: row.creditos, semestre: row.semestre,
    tipo: row.tipo, areaFormativa: row.area_formativa, prerrequisitos: row.prerrequisitos,
  };
}

export class PgMallaRepository implements MallaRepository {
  constructor(private readonly pool?: Pool) {}

  private get db(): Pool { return this.pool ?? getPool(); }

  async findAll(filter: MallaQuery): Promise<CursoMalla[]> {
    const result = await this.db.query<CursoRow>(
      `SELECT ${camposSql} FROM malla_curso mc
       JOIN malla_versiones mv ON mv.id = mc.malla_id
       JOIN cursos c ON c.id = mc.curso_id
       WHERE (CASE WHEN $1::text IS NULL THEN mv.vigente ELSE mv.id = $1 END)
         AND ($2::text IS NULL OR mc.area_formativa = $2)
         AND ($3::integer IS NULL OR mc.semestre = $3)
         AND ($4::text IS NULL OR mc.tipo = $4)
         AND ($5::text IS NULL OR strpos(trim(regexp_replace(normalize(lower(concat_ws(' ', c.nombre, mc.codigo)), NFD), U&'[\\0300-\\036F]', '', 'g')), $5) > 0)
       ORDER BY mc.semestre, mc.codigo`,
      [filter.version ?? null, filter.areaFormativa ?? null, filter.semestre ?? null,
        filter.tipo ?? null, filter.q ? normalizarTexto(filter.q) : null],
    );
    return result.rows.map(aCurso);
  }

  async findByCodigo(codigo: string): Promise<CursoMalla | null> {
    const result = await this.db.query<CursoRow>(
      `SELECT ${camposSql} FROM malla_curso mc
       JOIN malla_versiones mv ON mv.id = mc.malla_id AND mv.vigente
       JOIN cursos c ON c.id = mc.curso_id WHERE mc.codigo = $1`, [codigo],
    );
    return result.rows[0] ? aCurso(result.rows[0]) : null;
  }
}
