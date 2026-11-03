import Image from "next/image";
import Link from "next/link";
import type { Noticia } from "@/types";
import { HomeIcon } from "./HomeIcon";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
});

export function NewsSection({ noticias }: { noticias: readonly Noticia[] }) {
  return (
    <section aria-labelledby="home-news-title" className="min-w-0">
      <div className="flex items-center justify-between gap-4 border-b border-border-subtle/60 pb-2">
        <h2 id="home-news-title" className="font-serif text-xl font-bold tracking-tight text-text-main">Novedades</h2>
        <Link href="/novedades" className="inline-flex shrink-0 items-center gap-2 rounded text-[10px] font-medium text-epis-maroon hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-epis-maroon">
          Ver todas <HomeIcon name="arrow" className="h-3 w-3" />
        </Link>
      </div>
      <ul className="divide-y divide-border-subtle/40">
        {noticias.map((noticia) => (
          <li key={noticia.id}>
            <Link href={noticia.href} className="group flex items-center gap-3 rounded-lg px-1.5 py-3 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-epis-maroon sm:gap-3">
              <span className="relative flex h-[38px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-epis-maroon-light text-epis-maroon">
                {noticia.imagenUrl ? (
                  <Image src={noticia.imagenUrl} alt="" fill sizes="50px" className="object-cover" />
                ) : <HomeIcon name="news" className="h-6 w-6" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-normal leading-snug text-text-main group-hover:text-epis-maroon">{noticia.titulo}</span>
                <time dateTime={noticia.fecha} className="mt-1 block text-[9px] text-text-muted">
                  {dateFormatter.format(new Date(`${noticia.fecha}T00:00:00Z`))}
                </time>
              </span>
              <HomeIcon name="arrow" className="h-3 w-3 shrink-0 text-text-subtle group-hover:text-epis-maroon" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
