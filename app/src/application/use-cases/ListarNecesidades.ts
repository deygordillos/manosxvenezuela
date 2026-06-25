import { Necesidad } from "../../domain/entities/Necesidad";
import { pesoUrgencia } from "../../domain/value-objects/Urgencia";
import { NecesidadRepository } from "../ports/NecesidadRepository";

export class ListarNecesidades {
  constructor(private readonly repo: NecesidadRepository) {}

  async ejecutar(now: Date): Promise<Necesidad[]> {
    const necesidades = await this.repo.listarAbiertasVigentes(now);
    return necesidades.sort((a, b) => {
      const urgencia = pesoUrgencia(b.urgencia) - pesoUrgencia(a.urgencia);
      if (urgencia !== 0) {
        return urgencia;
      }

      return a.creadoEn.getTime() - b.creadoEn.getTime();
    });
  }
}
