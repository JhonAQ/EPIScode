import type { DocenteRepository, FiltrosDocentes } from "../ports/docente-repository";

/** Opciones disponibles para los filtros del directorio docente. */
export class ListarFiltrosDocentes {
  constructor(private readonly docentes: DocenteRepository) {}

  async execute(): Promise<FiltrosDocentes> {
    return this.docentes.listarFiltros();
  }
}
