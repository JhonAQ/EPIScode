import type { MallaVersion } from "@/types";
import type { MallaRepository } from "../ports/malla-repository";

/** Caso de uso: listar las versiones de la malla curricular garantizando que la versión vigente esté primera. */
export class ListarVersionesMalla {
  constructor(private readonly mallaRepository: MallaRepository) {}

  async execute(): Promise<MallaVersion[]> {
    const versiones = await this.mallaRepository.findVersiones();
    const vigentes = versiones.filter((v) => v.vigente);

    if (vigentes.length !== 1) {
      throw new Error("Debe existir exactamente una versión vigente de la malla curricular.");
    }

    const noVigentes = versiones.filter((v) => !v.vigente);
    return [vigentes[0], ...noVigentes];
  }
}
