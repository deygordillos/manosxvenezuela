import { type NecesidadRepository } from "../src/application/ports/NecesidadRepository";
import { EstadoNecesidad, Necesidad } from "../src/domain/entities/Necesidad";
import { TelefonoVE } from "../src/domain/value-objects/TelefonoVE";
import { pesoUrgencia } from "../src/domain/value-objects/Urgencia";

export class InMemoryNecesidadRepository implements NecesidadRepository {
  private readonly necesidades = new Map<string, Necesidad>();

  constructor(necesidades: readonly Necesidad[] = []) {
    for (const necesidad of necesidades) {
      this.necesidades.set(necesidad.id, necesidad);
    }
  }

  async guardar(necesidad: Necesidad): Promise<void> {
    this.necesidades.set(necesidad.id, necesidad);
  }

  async buscarPorTokenGestion(tokenGestion: string): Promise<Necesidad | null> {
    return [...this.necesidades.values()].find((necesidad) => necesidad.tokenGestion === tokenGestion) ?? null;
  }

  async contarActivasPorContacto(contacto: TelefonoVE, now: Date): Promise<number> {
    return [...this.necesidades.values()].filter(
      (necesidad) =>
        necesidad.contacto.value === contacto.value &&
        necesidad.estado === EstadoNecesidad.Abierta &&
        necesidad.caducaEn.getTime() > now.getTime(),
    ).length;
  }

  async cambiarEstado(id: string, estado: EstadoNecesidad): Promise<void> {
    const actual = this.necesidades.get(id);
    if (actual === undefined) {
      return;
    }

    const actualizada = Necesidad.crear({
      id: actual.id,
      titulo: actual.titulo,
      descripcion: actual.descripcion,
      habilidad: actual.habilidad,
      urgencia: actual.urgencia,
      estado,
      zona: actual.zona,
      contacto: actual.contacto,
      tokenGestion: actual.tokenGestion,
      caducaEn: actual.caducaEn,
      creadoEn: actual.creadoEn,
    });

    if (actualizada.ok) {
      this.necesidades.set(id, actualizada.value);
    }
  }

  async expirarVencidas(now: Date): Promise<number> {
    let total = 0;
    for (const necesidad of this.necesidades.values()) {
      if (necesidad.estado === EstadoNecesidad.Abierta && necesidad.caducaEn.getTime() <= now.getTime()) {
        await this.cambiarEstado(necesidad.id, EstadoNecesidad.Expirada);
        total += 1;
      }
    }

    return total;
  }

  async listarAbiertasVigentes(now: Date): Promise<Necesidad[]> {
    return [...this.necesidades.values()]
      .filter(
        (necesidad) =>
          necesidad.estado === EstadoNecesidad.Abierta && necesidad.caducaEn.getTime() > now.getTime(),
      )
      .sort((a, b) => {
        const urgencia = pesoUrgencia(b.urgencia) - pesoUrgencia(a.urgencia);
        return urgencia !== 0 ? urgencia : a.creadoEn.getTime() - b.creadoEn.getTime();
      });
  }
}
