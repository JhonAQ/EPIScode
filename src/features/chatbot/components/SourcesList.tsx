import type { ChatSource } from "@/types";

export interface SourcesListProps {
  sources: ChatSource[];
  citations?: string[];
}

export function SourcesList({ sources, citations = [] }: SourcesListProps) {
  const references = new Set(sources.map(({ source, chunkIndex }) => `${encodeURIComponent(source)}#${chunkIndex}`));
  return (
    <div className="mt-2 text-xs text-zinc-700 dark:text-zinc-300">
      <p className="break-words [overflow-wrap:anywhere]">Referencias citadas en el texto: {citations.length ? citations.map((citation) => `[${citation}]${references.has(citation) ? "" : " (sin fuente recuperada correspondiente)"}`).join(", ") : "ninguna"}.</p>
      {sources.length === 0 ? <p className="mt-1">No se recuperaron fuentes para esta respuesta.</p> : <details className="mt-2 rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
        <summary className="min-h-6 cursor-pointer font-medium focus-visible:outline-2">Fuentes recuperadas ({sources.length})</summary>
        <p className="my-2">Recuperada no significa citada ni verificada. La similitud coseno mide cercanía entre textos, no certeza.</p>
        <ul className="space-y-3">{sources.map((source, index) => {
          const reference = `${encodeURIComponent(source.source)}#${source.chunkIndex}`;
          return <li key={`${reference}-${index}`} className="min-w-0 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <p className="break-words font-medium [overflow-wrap:anywhere]">{source.source} · Fragmento {source.chunkIndex}</p>
            <p>{citations.includes(reference) ? "Citada en el texto" : "Recuperada; no citada"} · Similitud coseno: {source.score.toFixed(3)}</p>
            <p className="mt-1 whitespace-pre-wrap break-words leading-5 [overflow-wrap:anywhere]">{source.content ? `${source.content.slice(0, 350)}${source.content.length > 350 ? "…" : ""}` : "Sin extracto disponible."}</p>
          </li>;
        })}</ul>
      </details>}
    </div>
  );
}
