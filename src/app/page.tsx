import { HeroSection, NewsSection, QuickLinksSection } from "@/features/home";
import { NOTICIAS_MOCK } from "@/mocks/noticias";

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <HeroSection />
      <div className="mx-auto w-full max-w-[984px] px-6 pb-16 pt-6 sm:px-10 sm:pb-24 lg:px-14 lg:pt-8">
        {/* La tercera columna podrá recibir el evento destacado de otra issue. */}
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,352px)_minmax(0,216px)_minmax(0,1fr)] lg:gap-10">
          <NewsSection noticias={NOTICIAS_MOCK} />
          <QuickLinksSection />
        </div>
      </div>
    </div>
  );
}
