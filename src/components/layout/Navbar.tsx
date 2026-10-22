"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";

interface DropdownItem {
  title: string;
  description: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Institucional", href: "/institucional" },
  {
    label: "Académica",
    href: "/academica",
    dropdown: [
      {
        title: "Mallas Curriculares",
        description: "Plan de estudios y prerrequisitos por semestre",
        href: "/academica/mallas",
      },
      {
        title: "Repositorio Académico",
        description: "Sílabos, materiales y guías académicas",
        href: "/academica/repositorio",
      },
    ],
  },
  { label: "Novedades", href: "/novedades" },
  { label: "Comunidad", href: "/comunidad" },
  { label: "Contacto", href: "/contacto" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const dropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const isItemActive = (item: NavItem) => {
    if (item.href === "/" && pathname === "/") return true;
    if (item.href !== "/" && pathname.startsWith(item.href)) return true;
    if (item.dropdown?.some((d) => pathname.startsWith(d.href))) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-border-subtle transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo EPIS - UNSA */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-epis-maroon rounded-lg"
          >
            {/* 4-quadrant EPIS Icon */}
            <div className="grid grid-cols-2 gap-1 w-7 h-7 shrink-0 text-epis-maroon">
              <span className="w-3 h-3 bg-epis-maroon rounded-[3px] group-hover:scale-95 transition-transform" />
              <span className="w-3 h-3 bg-epis-maroon rounded-[3px] group-hover:scale-95 transition-transform" />
              <span className="w-3 h-3 bg-epis-maroon rounded-[3px] group-hover:scale-95 transition-transform" />
              <span className="w-3 h-3 bg-epis-maroon rounded-[3px] group-hover:scale-95 transition-transform" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-text-main">
                EPIS
              </span>
              <span className="bg-epis-maroon-light text-epis-maroon text-[11px] font-semibold px-2 py-0.5 rounded-full border border-epis-maroon/10">
                UNSA
              </span>
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:block h-8 w-[1px] bg-zinc-300 mx-1" />

            {/* Subtext */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[11px] text-text-muted leading-tight">
                Escuela Profesional de
              </span>
              <span className="text-xs font-semibold text-text-main leading-tight">
                Ingeniería de Sistemas
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
              const isOpen = activeDropdown === item.label;

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasDropdown && handleMouseEnter(item.label)}
                  onMouseLeave={() => hasDropdown && handleMouseLeave()}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "px-3.5 py-2 text-sm font-medium transition-colors relative flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-epis-maroon rounded-md",
                      active
                        ? "text-epis-maroon font-semibold"
                        : "text-text-muted hover:text-text-main"
                    )}
                  >
                    <span>{item.label}</span>
                    {hasDropdown && (
                      <svg
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200 text-current",
                          isOpen && "rotate-180"
                        )}
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
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                    {/* Active Underline Indicator */}
                    {active && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-epis-maroon rounded-full" />
                    )}
                  </Link>

                  {/* Dropdown Menu (Figma: Dropdown Menu Box.png) */}
                  {hasDropdown && isOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* Triangle Pointer */}
                      <div className="w-3 h-3 bg-surface-card rotate-45 border-t border-l border-border-subtle/50 mx-auto -mb-1.5 shadow-sm" />

                      <div className="bg-surface-card rounded-2xl shadow-card-hover border border-border-subtle/60 p-2.5 backdrop-blur-sm">
                        {item.dropdown?.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block p-3 rounded-xl hover:bg-epis-maroon-light/50 transition-colors group text-left"
                          >
                            <div className="font-semibold text-sm text-text-main group-hover:text-epis-maroon transition-colors">
                              {subItem.title}
                            </div>
                            <div className="text-xs text-text-muted leading-relaxed mt-0.5">
                              {subItem.description}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action Icons & Login Button */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search Trigger */}
            <div className="relative">
              {searchOpen ? (
                <div className="w-64">
                  <SearchInput
                    variant="pill"
                    placeholder="Buscar en el portal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Abrir buscador"
                  className="p-2 text-text-muted hover:text-epis-maroon hover:bg-surface-subtle rounded-full transition-colors cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Login Gestores Button */}
            <Button
              variant="primary"
              size="md"
              className="gap-2 px-5 font-semibold"
              rightIcon={
                <svg
                  className="w-4 h-4"
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
              Login Gestores
            </Button>
          </div>

          {/* Mobile Menu & Search Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
              className="p-2 text-text-muted hover:text-text-main rounded-lg"
            >
              <svg
                className="w-5 h-5"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="p-2 text-text-muted hover:text-text-main rounded-lg focus:outline-none focus:ring-2 focus:ring-epis-maroon"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Bar */}
        {searchOpen && (
          <div className="lg:hidden pb-3 pt-1">
            <SearchInput
              variant="pill"
              placeholder="Buscar en el portal de la EPIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-subtle bg-surface-card px-4 pt-4 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);

              return (
                <div key={item.label} className="flex flex-col">
                  <Link
                    href={item.href}
                    onClick={() => !hasDropdown && setMobileMenuOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between",
                      active
                        ? "bg-epis-maroon-light text-epis-maroon font-semibold"
                        : "text-text-main hover:bg-surface-subtle"
                    )}
                  >
                    <span>{item.label}</span>
                  </Link>

                  {/* Mobile Dropdown Subitems */}
                  {hasDropdown && (
                    <div className="pl-4 pr-2 py-1 space-y-1">
                      {item.dropdown?.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg text-xs text-text-muted hover:text-epis-maroon hover:bg-surface-subtle transition-colors"
                        >
                          <div className="font-semibold text-text-main">
                            {subItem.title}
                          </div>
                          <div className="text-[11px] text-text-muted">
                            {subItem.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-border-subtle">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center gap-2"
              rightIcon={
                <svg
                  className="w-4 h-4"
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
              Login Gestores
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
