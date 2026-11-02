import type { ChatSource } from "@/types";

export interface SourcesListProps {
  sources: ChatSource[];
}

export function SourcesList({ sources }: SourcesListProps) {
  return (
    <details className="mt-3 border-t border-border-subtle pt-2 text-sm">
      <summary className="cursor-pointer font-medium underline underline-offset-4">Ver fuentes</summary>
      <ul className="mt-2 space-y-2">
        {sources.map((source) => (
          <li key={`${source.source}-${source.chunkIndex}`} className="rounded-xl bg-white/70 p-3">
            <p className="font-medium">{source.source} · fragmento {source.chunkIndex + 1}</p>
            <p className="mt-1 line-clamp-3 text-text-muted">{source.content}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}
