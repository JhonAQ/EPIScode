import Link from "next/link";
import { HomeIcon } from "./HomeIcon";

const quickLinks = [
  { label: "Mallas Curriculares", href: "/academica/mallas", icon: "curriculum", featured: false },
  { label: "Repositorio Digital", href: "/academica/repositorio", icon: "repository", featured: true },
] as const;

export function QuickLinksSection() {
  return (
    <section aria-labelledby="home-quick-links-title" className="min-w-0">
      <h2 id="home-quick-links-title" className="mb-3 font-serif text-xl font-bold tracking-tight text-text-main">Accesos rápidos</h2>
      <ul className="space-y-2">
        {quickLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-epis-maroon ${link.featured
              ? "border-epis-maroon bg-epis-maroon text-white hover:bg-epis-maroon-hover"
              : "border-border-subtle/70 bg-surface-card text-text-main hover:bg-surface-muted"}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${link.featured ? "border-white/20 bg-white/5" : "border-epis-maroon/15 bg-epis-maroon-light text-epis-maroon"}`}>
                <HomeIcon name={link.icon} className="h-3.5 w-3.5" />
              </span>
              <span className="max-w-20 flex-1 text-[10px] font-medium leading-snug">{link.label}</span>
              <HomeIcon name="arrow" className={`ml-auto h-3 w-3 shrink-0 ${link.featured ? "text-white/70" : "text-text-subtle"}`} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
