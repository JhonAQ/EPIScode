import {
  FeaturedEventSection,
  HeroSection,
  featuredEvent,
} from "@/features/home";

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

      <div className="mx-auto flex w-full max-w-[1360px] justify-center px-6 py-12 sm:px-10 lg:justify-end lg:px-16">
        <div className="w-full max-w-sm lg:max-w-[230px]">
          <FeaturedEventSection event={featuredEvent} />
        </div>
      </div>

      {/* Secciones del Home que desarrollará el equipo en el Sprint 1:
          - <NewsSection />
          - <QuickLinksSection />
          - <FloatingAnaiWidget />
      */}
    </div>
  );
}
