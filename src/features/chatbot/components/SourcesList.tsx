import type { ChatSource } from "@/types";
export interface SourcesListProps { sources: ChatSource[] }
export function SourcesList({ sources }: SourcesListProps) {
  if (!sources.length) return <p className="mt-3 text-xs text-zinc-500">Sin fuentes recuperadas.</p>;
  return <details className="mt-3 rounded border border-zinc-300 p-3 text-sm"><summary className="cursor-pointer font-medium">Fuentes consultadas ({sources.length})</summary>
    {sources.map((s, i) => <div key={s.source + ":" + s.chunkIndex} className="mt-3 border-t border-zinc-300 pt-3">
      <p className="font-medium">[{i + 1}] {s.source} · fragmento {s.chunkIndex + 1} · similitud {s.score.toFixed(3)}</p>
      <p className="mt-1 whitespace-pre-wrap text-xs">{s.content}</p>
    </div>)}</details>;
}
