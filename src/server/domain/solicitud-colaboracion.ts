export const TIPOS_INTERES = ["investigacion", "practicas", "alianzas"] as const;

export type TipoInteres = (typeof TIPOS_INTERES)[number];

export interface SolicitudColaboracion {
  nombre: string;
  correo: string;
  tipoInteres: TipoInteres;
  mensaje: string;
}
