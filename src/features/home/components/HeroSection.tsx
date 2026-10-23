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
 * 5. El ancho máximo del contenedor principal es `max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16`.
 */
export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-10 sm:py-14 lg:py-16">
      {/* Contenedor responsivo con padding horizontal balanceado acorde a Figma */}
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* ================================================================
              COLUMNA IZQUIERDA: Titular, propuesta de valor y llamada a la acción
              ================================================================ */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-7 relative z-10 text-left">
            
            {/* Detalle decorativo institucional: Trazo horizontal, diagonal a 45° y vertical con punto */}
            <div
              className="absolute -left-7 -top-4 hidden sm:block pointer-events-none select-none"
              aria-hidden="true"
            >
              <svg
                width="68"
                height="145"
                viewBox="0 0 68 145"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Dot */}
                <circle cx="62" cy="12" r="3" fill="#6E1122" />
                {/* Polyline: Horizontal -> Diagonal 45° -> Vertical */}
                <path
                  d="M 62 12 L 38 12 L 12 38 L 12 140"
                  stroke="#6E1122"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="miter"
                />
              </svg>
            </div>

            {/* Badge superior de pertenencia facultativa */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-zinc-200/90 bg-white shadow-xs">
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-zinc-700 uppercase">
                Facultad de Ingeniería de Producción y Servicios
              </span>
            </div>

            {/* Titular Principal Institucional con contraste tipográfico */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.08] text-zinc-900">
              <span className="block">Ingeniería de</span>
              <span className="block text-epis-maroon">Sistemas</span>
            </h1>

            {/* Subtítulo / Propuesta de valor */}
            <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed max-w-lg">
              Tecnología, innovación y personas para un mejor mañana.
            </p>

            {/* Fila de acción: Botón CTA y micro-descripción */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-1">
              <Link href="/institucional">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-full px-7 py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all gap-2"
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

              {/* Separador vertical */}
              <div className="hidden sm:block h-9 w-[1.5px] bg-epis-maroon/20 mx-1 shrink-0" />

              {/* Mensaje complementario */}
              <p className="text-xs sm:text-sm text-zinc-500 max-w-[210px] leading-snug">
                Soluciones digitales para un mundo en constante transformación.
              </p>
            </div>
          </div>

          {/* ================================================================
              COLUMNA DERECHA: Composición gráfica compacta y proporcionada
              ================================================================ */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[400px] aspect-[4/5] flex items-center justify-center">
              
              {/* Anillos concéntricos institucionales de fondo */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                aria-hidden="true"
              >
                <div className="w-[220px] h-[220px] sm:w-[250px] sm:h-[250px] rounded-full border border-epis-maroon/20" />
                <div className="absolute w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] rounded-full border border-epis-maroon/15" />
                <div className="absolute w-[380px] h-[380px] sm:w-[420px] sm:h-[420px] rounded-full border border-epis-maroon/10" />
              </div>

              {/* Bloque geométrico superior izquierdo */}
              <div
                className="absolute top-8 left-1 sm:left-3 w-24 h-16 sm:w-28 sm:h-20 bg-epis-maroon rounded-lg opacity-90 shadow-sm z-0 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white/40 text-xs font-mono font-light select-none">
                  +
                </span>
              </div>

              {/* Bloque geométrico inferior derecho */}
              <div
                className="absolute bottom-4 right-1 sm:right-3 w-20 h-28 sm:w-24 sm:h-36 bg-epis-maroon rounded-lg opacity-95 shadow-sm z-0 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white/40 text-xs font-mono font-light select-none">
                  +
                </span>
              </div>

              {/* Fotografía del estudiante compacta y nítida */}
              <div className="relative z-10 w-full h-full flex items-end justify-center">
                <Image
                  src="/assets/hero-student.png"
                  alt="Estudiante de la Escuela Profesional de Ingeniería de Sistemas - UNSA"
                  width={400}
                  height={500}
                  priority
                  className="w-auto h-[88%] sm:h-[92%] object-contain select-none pointer-events-none"
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
