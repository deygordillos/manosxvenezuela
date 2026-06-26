import { EstadoNecesidad, Necesidad } from "../../domain/entities/Necesidad";
import { VoluntarioRepository } from "../ports/VoluntarioRepository";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { Urgencia, pesoUrgencia } from "../../domain/value-objects/Urgencia";
import { NecesidadRepository } from "../ports/NecesidadRepository";
import { EmparejarVoluntarios } from "./EmparejarVoluntarios";

export type FiltrosListadoNecesidades = {
  readonly estado?: EstadoNecesidad;
  readonly zona?: string;
  readonly habilidad?: Habilidad;
};

export type EstadoPulso = "verde" | "ambar" | "rojo";

export type ListadoNecesidades = {
  readonly necesidades: readonly Necesidad[];
  readonly estadoPulso: EstadoPulso;
};

export class ListarNecesidades {
  constructor(
    private readonly repo: NecesidadRepository,
    private readonly voluntarios?: VoluntarioRepository,
  ) {}

  async ejecutar(now: Date, filtros: FiltrosListadoNecesidades = {}): Promise<ListadoNecesidades> {
    const estado = filtros.estado ?? EstadoNecesidad.Abierta;
    const necesidades = (await this.repo.listarPorEstado(estado, now))
      .filter((necesidad) => filtros.zona === undefined || necesidad.zona.estadoGeo === filtros.zona)
      .filter((necesidad) => filtros.habilidad === undefined || necesidad.habilidad === filtros.habilidad)
      .sort((a, b) => {
        const urgencia = pesoUrgencia(b.urgencia) - pesoUrgencia(a.urgencia);
        if (urgencia !== 0) {
          return urgencia;
        }

        return b.creadoEn.getTime() - a.creadoEn.getTime();
      });

    return {
      necesidades,
      estadoPulso: await this.calcularEstadoPulso(necesidades),
    };
  }

  private async calcularEstadoPulso(necesidades: readonly Necesidad[]): Promise<EstadoPulso> {
    const criticas = necesidades.filter((necesidad) => necesidad.urgencia === Urgencia.Critica);
    if (criticas.length === 0) {
      return "verde";
    }

    if (this.voluntarios === undefined) {
      return "ambar";
    }

    const emparejar = new EmparejarVoluntarios(this.voluntarios);
    for (const critica of criticas) {
      const matches = await emparejar.ejecutar(critica);
      if (matches.ok && matches.value.length === 0) {
        return "rojo";
      }
    }

    return "ambar";
  }
}
