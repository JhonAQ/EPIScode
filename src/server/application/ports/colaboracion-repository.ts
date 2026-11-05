import type { SolicitudColaboracion } from "@/server/domain/solicitud-colaboracion";

/** Puerto de salida para registrar solicitudes de colaboración. */
export interface ColaboracionRepository {
  guardar(solicitud: SolicitudColaboracion): Promise<void>;
}
