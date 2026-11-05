import type { ColaboracionRepository } from "@/server/application/ports/colaboracion-repository";
import type { SolicitudColaboracion } from "@/server/domain/solicitud-colaboracion";

/** Almacenamiento temporal para desarrollo; se pierde al reiniciar el proceso. */
export class InMemoryColaboracionRepository implements ColaboracionRepository {
  constructor(private readonly solicitudes: SolicitudColaboracion[] = []) {}

  async guardar(solicitud: SolicitudColaboracion): Promise<void> {
    this.solicitudes.push({ ...solicitud });
  }
}
