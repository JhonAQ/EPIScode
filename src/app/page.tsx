import { HeroSection } from "@/features/home";

/**
 * ============================================================================
 * VISTA PRINCIPAL (HOME PAGE) - PORTAL EPIS UNSA
 * ============================================================================
 * Esta página representa el Golden Path del portal.
 *
 * Estructura de Secciones:
 * 1. HeroSection (Sprint 0) -> Implementado como referencia de diseño y arquitectura.
 * 2. Novedades / Noticias (Sprint 1 - #11).
 * 3. Accesos Rápidos y Eventos Destacados (Sprint 1 - #12).
 * 4. Widget Flotante ANAI (Sprint 1 - #13).
 */
export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* 1. Hero Section Golden Path */}
      <HeroSection />

      {/* Secciones del Home que desarrollará el equipo en el Sprint 1:
          - <NewsSection />
          - <QuickLinksSection />
          - <FeaturedEventSection />
          - <FloatingAnaiWidget />
      */}
    </div>
  );
}
