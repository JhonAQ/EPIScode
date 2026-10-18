import type { ChatSource } from "@/types";

export interface SourcesListProps {
  sources: ChatSource[];
}

/** Permite consultar de forma progresiva los fragmentos que respaldan la respuesta. */
export function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) {
    return <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">No se encontraron fuentes para esta respuesta.</p>;
  }

  return (
    <details className="mt-3 border-t border-zinc-200 pt-2 text-xs dark:border-zinc-700">
      <summary className="cursor-pointer font-medium underline underline-offset-2">
        Fuentes consultadas ({sources.length})
      </summary>
      <ul className="mt-2 space-y-3">
        {sources.map((source) => (
          <li key={`${source.source}-${source.chunkIndex}`}>
            <p className="font-medium">
              {source.source} · fragmento {source.chunkIndex + 1}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{source.content}</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Similitud: {source.score.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
