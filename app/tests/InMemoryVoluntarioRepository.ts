import {
  type CriterioMatch,
  type VoluntarioRepository,
} from "../src/application/ports/VoluntarioRepository";
import { EstadoVoluntario, Voluntario } from "../src/domain/entities/Voluntario";

export class InMemoryVoluntarioRepository implements VoluntarioRepository {
  private readonly voluntarios = new Map<string, Voluntario>();

  constructor(voluntarios: readonly Voluntario[] = []) {
    for (const voluntario of voluntarios) {
      this.voluntarios.set(voluntario.id, voluntario);
    }
  }

  async guardar(voluntario: Voluntario): Promise<void> {
    this.voluntarios.set(voluntario.id, voluntario);
  }

  async buscarCompatibles(criterio: CriterioMatch): Promise<Voluntario[]> {
    return [...this.voluntarios.values()].filter(
      (voluntario) =>
        voluntario.estado === criterio.estado && voluntario.tieneHabilidad(criterio.habilidad),
    );
  }

  async cambiarEstado(id: string, estado: EstadoVoluntario): Promise<void> {
    const actual = this.voluntarios.get(id);
    if (actual === undefined) {
      return;
    }

    const actualizado = Voluntario.crear({
      id: actual.id,
      nombre: actual.nombre,
      telefono: actual.telefono,
      habilidades: [...actual.habilidades],
      estado,
      zona: actual.zona,
      radioKm: actual.radioKm,
      tokenGestion: actual.tokenGestion,
      creadoEn: actual.creadoEn,
    });

    if (actualizado.ok) {
      this.voluntarios.set(id, actualizado.value);
    }
  }
}
