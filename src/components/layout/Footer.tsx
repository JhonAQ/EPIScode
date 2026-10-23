import * as React from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-epis-maroon text-white">
      {/* Main Footer Container - Compact & proportional spacing */}
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-16 py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Column 1 & 2: Institutional Brand & Description */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              {/* Official Logo on crisp white container to preserve original brand colors */}
              <div className="bg-white px-2.5 py-1 rounded-lg inline-flex items-center shadow-xs shrink-0">
                <Image
                  src="/assets/logo-epis.png"
                  alt="Escuela Profesional de Ingeniería de Sistemas"
                  width={115}
                  height={32}
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </div>

              {/* Vertical Separator */}
              <div className="h-7 w-[1px] bg-white/25 mx-0.5 shrink-0" />

              {/* Institutional Typography without tags */}
              <div className="flex flex-col text-left justify-center select-none leading-tight">
                <span className="text-xs font-semibold text-white tracking-tight">
                  Escuela Profesional
                </span>
                <span className="text-[11px] font-normal text-white/85">
                  de Ingeniería de Sistemas
                </span>
                <span className="text-[11px] font-bold text-white tracking-wider uppercase">
                  UNSA
                </span>
              </div>
            </Link>

            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              Escuela Profesional de Ingeniería de Sistemas de la Universidad
              Nacional de San Agustín de Arequipa. Formando líderes en tecnología,
              investigación e innovación.
            </p>

            <p className="text-[11px] text-white/70 font-medium">
              Programa acreditado nacional e internacionalmente por ICACIT y SINEACE.
            </p>

            {/* Social Links with SVG Vectors (Compact) */}
            <div className="flex items-center space-x-2 pt-1">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook institucional EPIS UNSA"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn oficial EPIS UNSA"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.222 0h.003z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/JhonAQ/EPIScode"
                target="_blank"
                rel="noreferrer"
                aria-label="Repositorio GitHub de EPIScode"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 3: Enlaces Rápidos */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href="/"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/institucional"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Institucional
                </Link>
              </li>
              <li>
                <Link
                  href="/academica/mallas"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Mallas Curriculares
                </Link>
              </li>
              <li>
                <Link
                  href="/academica/repositorio"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Repositorio Académico
                </Link>
              </li>
              <li>
                <Link
                  href="/novedades"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Novedades y Eventos
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Académico y Servicios */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Académico
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href="/comunidad"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Directorio Docente
                </Link>
              </li>
              <li>
                <a
                  href="https://sisacad.unsa.edu.pe"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Portal SISACAD
                </a>
              </li>
              <li>
                <a
                  href="https://biblioteca.unsa.edu.pe"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Biblioteca Central
                </a>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Mesa de Partes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Ubicación y Contacto */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Ubicación
            </h4>
            <div className="space-y-2 text-xs text-white/80 leading-relaxed">
              <div className="flex items-start gap-2">
                <svg
                  className="w-3.5 h-3.5 text-epis-gold mt-0.5 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  Pabellón EPIS, Campus Área de Ingenierías, Av. Venezuela s/n,
                  Arequipa - Perú
                </span>
              </div>

              <div className="flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5 text-epis-gold shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>epis@unsa.edu.pe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-8 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/70">
          <p>
            &copy; {new Date().getFullYear()} Escuela Profesional de Ingeniería
            de Sistemas &mdash; Universidad Nacional de San Agustín de Arequipa.
          </p>
          <div className="flex items-center space-x-5">
            <Link
              href="/contacto"
              className="hover:text-white transition-colors"
            >
              Contacto
            </Link>
            <Link
              href="/institucional"
              className="hover:text-white transition-colors"
            >
              Transparencia
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
