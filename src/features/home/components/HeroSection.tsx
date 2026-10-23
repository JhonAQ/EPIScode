import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * ============================================================================
 * GOLDEN PATH (CAMINO DORADO) - COMPONENTE DE REFERENCIA
 * ============================================================================
 * HeroSection: Sección principal de bienvenida del portal institucional.
 *
 * Guía para desarrolladores del equipo:
 * 1. Todos los colores institucionales se consumen mediante clases Tailwind v4:
 *    - `text-epis-maroon` o `bg-epis-maroon` (#6E1122).
 *    - `bg-epis-maroon-light` para fondos con tinte institucional suave.
 * 2. Cero emojis como iconos; usar únicamente SVGs vectoriales nativos accesibles.
 * 3. Prohibido el uso de `border-left` acentuado según las reglas de diseño globales.
 * 4. Componentes atómicos se importan desde `@/components/ui`.
 */
export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-12 sm:py-16 lg:py-20 xl:py-24">
      {/* Contenedor responsivo amplio para resoluciones modernas */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ================================================================
              COLUMNA IZQUIERDA: Titular, propuesta de valor y llamada a la acción
              ================================================================ */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8 relative z-10 text-left">
            
            {/* Detalle decorativo de esquina institucional (punto y trazo angular) */}
            <div
              className="absolute -left-6 -top-3 hidden xl:block pointer-events-none select-none"
              aria-hidden="true"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-epis-maroon ml-8" />
              <div className="w-8 h-24 border-t border-l border-epis-maroon/70 rounded-tl-lg mt-0.5" />
            </div>

            {/* Badge superior de pertenencia facultativa */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-zinc-200/80 bg-white shadow-xs">
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                Facultad de Ingeniería de Producción y Servicios
              </span>
            </div>

            {/* Titular Principal Institucional con contraste de color */}
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08] text-zinc-900">
              <span className="block">Ingeniería de</span>
              <span className="block text-epis-maroon">Sistemas</span>
            </h1>

            {/* Subtítulo / Propuesta de valor */}
            <p className="text-lg sm:text-xl text-zinc-600 font-normal leading-relaxed max-w-xl">
              Tecnología, innovación y personas para un mejor mañana.
            </p>

            {/* Fila de acción: Botón CTA y micro-descripción */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
              <Link href="/institucional">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-full px-7 py-3.5 text-base font-semibold shadow-md hover:shadow-lg transition-all gap-2"
                  rightIcon={
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  }
                >
                  Conoce la carrera
                </Button>
              </Link>

              {/* Separador vertical discreto */}
              <div className="hidden sm:block h-10 w-[1.5px] bg-epis-maroon/20 mx-1 shrink-0" />

              {/* Mensaje complementario */}
              <p className="text-xs sm:text-sm text-zinc-500 max-w-[220px] leading-snug">
                Soluciones digitales para un mundo en constante transformación.
              </p>
            </div>
          </div>

          {/* ================================================================
              COLUMNA DERECHA: Composición gráfica con estudiante y anillos
              ================================================================ */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] aspect-[4/5] flex items-center justify-center">
              
              {/* Anillos concéntricos institucionales de fondo */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                aria-hidden="true"
              >
                <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full border border-epis-maroon/25" />
                <div className="absolute w-[380px] h-[380px] sm:w-[420px] sm:h-[420px] rounded-full border border-epis-maroon/15" />
                <div className="absolute w-[480px] h-[480px] sm:w-[520px] sm:h-[520px] rounded-full border border-epis-maroon/10" />
              </div>

              {/* Bloque geométrico superior izquierdo */}
              <div
                className="absolute top-10 left-2 sm:left-4 w-28 h-20 sm:w-36 sm:h-24 bg-epis-maroon rounded-xl opacity-90 shadow-sm z-0 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white/40 text-xs font-mono font-light select-none">
                  +
                </span>
              </div>

              {/* Bloque geométrico inferior derecho */}
              <div
                className="absolute bottom-6 right-2 sm:right-4 w-24 h-36 sm:w-32 sm:h-44 bg-epis-maroon rounded-xl opacity-95 shadow-sm z-0 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white/40 text-xs font-mono font-light select-none">
                  +
                </span>
              </div>

              {/* Fotografía del estudiante recortada desde /assets/hero-student.png */}
              <div className="relative z-10 w-full h-full flex items-end justify-center">
                <Image
                  src="/assets/hero-student.png"
                  alt="Estudiante de la Escuela Profesional de Ingeniería de Sistemas - UNSA"
                  width={520}
                  height={620}
                  priority
                  className="w-auto h-[90%] sm:h-[95%] object-contain select-none pointer-events-none drop-shadow-xs"
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
