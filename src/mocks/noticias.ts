import type { Noticia } from "@/types";

/** Datos de ejemplo basados en la referencia visual; no son publicaciones reales.
 * Los enlaces apuntan al listado previsto hasta contar con rutas de detalle.
 */
export const NOTICIAS_MOCK: Noticia[] = [
  {
    id: "noticia-001",
    imagenUrl: "/assets/noticias/concurso-investigacion-2026.png",
    titulo: "Convocatoria a concurso de investigación 2026",
    fecha: "2025-04-12",
    href: "/novedades",
  },
  {
    id: "noticia-002",
    imagenUrl: "/assets/noticias/taller-ciberseguridad.png",
    titulo: "Taller de ciberseguridad para la comunidad universitaria",
    fecha: "2025-04-08",
    href: "/novedades",
  },
  {
    id: "noticia-003",
    imagenUrl: "/assets/noticias/hackathon-unsa-2025.png",
    titulo: "Hackathon UNSA 2025: ¡Participa!",
    fecha: "2025-04-02",
    href: "/novedades",
  },
];
