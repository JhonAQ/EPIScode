import { InvalidQueryError } from "@/server/domain/errors";
import type { Docente } from "@/types";
import type { DocenteRepository } from "../ports/docente-repository";

/** Caso de uso: consultar el detalle de un docente por identificador. */
export class ObtenerDocente {
  constructor(private readonly docentes: DocenteRepository) {}

  async execute(id: string): Promise<Docente | null> {
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new InvalidQueryError("El identificador del docente es obligatorio.");
    }

    return await this.docentes.findById(id.trim());
  }
}
