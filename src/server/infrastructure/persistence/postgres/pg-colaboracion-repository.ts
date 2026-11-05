import type { Pool } from "pg";
import type { ColaboracionRepository } from "@/server/application/ports/colaboracion-repository";
import type { SolicitudColaboracion } from "@/server/domain/solicitud-colaboracion";
import { getPool } from "./pool";

/** Persiste solicitudes mediante el mismo puerto que el repositorio en memoria. */
export class PgColaboracionRepository implements ColaboracionRepository {
  constructor(private readonly pool?: Pool) {}

  async guardar(solicitud: SolicitudColaboracion): Promise<void> {
    await (this.pool ?? getPool()).query(
      `INSERT INTO solicitudes_colaboracion (nombre, correo, tipo_interes, mensaje)
       VALUES ($1, $2, $3, $4)`,
      [solicitud.nombre, solicitud.correo, solicitud.tipoInteres, solicitud.mensaje],
    );
  }
}
