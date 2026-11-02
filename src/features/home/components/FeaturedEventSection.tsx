import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FeaturedEvent } from "../types";

export interface FeaturedEventSectionProps {
  event: FeaturedEvent;
  className?: string;
}

export function FeaturedEventSection({
  event,
  className,
}: FeaturedEventSectionProps) {
  const actionClassName =
    "inline-flex min-h-11 max-w-full items-center justify-center gap-4 self-start rounded-full border border-white/50 px-4 py-2 text-xs text-white transition-colors";
  const actionContent = (
    <>
      Más información
      <svg
        width="16"
        height="16"
        className="shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </>
  );

  return (
    <article
      className={cn(
        "relative isolate flex min-h-[324px] w-full min-w-0 flex-col overflow-hidden rounded-[28px] bg-linear-to-br from-black via-epis-maroon-dark to-epis-maroon-dark p-6 font-sans text-white shadow-[0_18px_28px_-12px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 bottom-0 -z-10 h-64 w-56 rounded-full bg-epis-maroon/30 blur-3xl"
        aria-hidden="true"
      />
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-white/10"
        viewBox="0 0 230 324"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <circle cx="245" cy="128" r="110" stroke="currentColor" />
        <circle cx="245" cy="128" r="160" stroke="currentColor" />
        <circle cx="190" cy="344" r="110" stroke="currentColor" opacity=".5" />
        <circle cx="190" cy="344" r="145" stroke="currentColor" opacity=".4" />
        <circle cx="45" cy="395" r="120" stroke="currentColor" opacity=".3" />
      </svg>

      <p className="text-[10px] font-medium tracking-[0.2em] text-white/75">
        PRÓXIMO EVENTO
      </p>
      <h2 className="mt-4 text-[26px] font-semibold leading-[1.12] tracking-tight wrap-anywhere">
        {event.title}
      </h2>

      <div className="mt-6 space-y-3 text-xs leading-relaxed text-white/85">
        <p className="flex items-start gap-2.5">
          <svg
            className="mt-0.5 size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="4" y="5" width="16" height="16" rx="2" />
            <path d="M8 3v4m8-4v4M4 11h16" />
          </svg>
          <span className="min-w-0 wrap-anywhere">{event.dateLabel}</span>
        </p>
        <p className="flex items-start gap-2.5">
          <svg
            className="mt-0.5 size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span className="min-w-0 wrap-anywhere">
            <span className="block">{event.venue}</span>
            <span className="block">{event.campus}</span>
          </span>
        </p>
      </div>

      <div className="mt-5">
        {event.href ? (
          <Link
            href={event.href}
            className={cn(
              actionClassName,
              "hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
            )}
          >
            {actionContent}
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title="Enlace del evento pendiente de confirmación"
            className={cn(actionClassName, "cursor-not-allowed opacity-70")}
          >
            {actionContent}
          </button>
        )}
      </div>
    </article>
  );
}
