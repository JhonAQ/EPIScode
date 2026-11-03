/** Resumen de una noticia para las tarjetas de Novedades del inicio. */
export interface Noticia {
  id: string;
  titulo: string;
  /** Fecha de publicación en formato YYYY-MM-DD. */
  fecha: string;
  href: string;
  /** Ruta de la miniatura. Si falta, la tarjeta muestra un reemplazo visual. */
  imagenUrl?: string;
}
