import type { ChatSource } from "@/types";

export interface SourcesListProps {
  sources: ChatSource[];
}

/**
 * TODO (Integrante D): mostrar los fragmentos que respaldaron la respuesta
 * (archivo, número de fragmento, similitud y un extracto). Idealmente colapsable.
 * Es clave para depurar el retrieval: si la respuesta es mala, ¿las fuentes eran las correctas?
 */
export function SourcesList({ sources }: SourcesListProps) {
  void sources;
  throw new Error("TODO: implementar SourcesList");
}
