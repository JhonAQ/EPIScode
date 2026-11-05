import type { ColaboracionRepository } from "@/server/application/ports/colaboracion-repository";
import type { SolicitudColaboracion } from "@/server/domain/solicitud-colaboracion";

export class RegistrarColaboracion {
  constructor(private readonly colaboraciones: ColaboracionRepository) {}

  async execute(solicitud: SolicitudColaboracion): Promise<void> {
    await this.colaboraciones.guardar(solicitud);
  }
}
