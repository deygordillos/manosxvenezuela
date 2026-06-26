import { EstadoNecesidad } from "../../domain/entities/Necesidad";
import { DomainError } from "../../domain/errors/DomainError";
import { Result, type Result as ResultType } from "../../shared/Result";
import { NecesidadRepository } from "../ports/NecesidadRepository";
import { type EnlaceContacto, type Notificador } from "../ports/Notificador";

export class GenerarContactoWhatsapp {
  constructor(
    private readonly necesidades: NecesidadRepository,
    private readonly notificador: Notificador,
  ) {}

  async ejecutar(necesidadId: string): Promise<ResultType<EnlaceContacto, DomainError>> {
    const necesidad = await this.necesidades.buscarPorId(necesidadId);
    if (necesidad === null) {
      return Result.err(new DomainError("NECESIDAD_INVALIDA", "Necesidad no encontrada"));
    }

    if (necesidad.estado === EstadoNecesidad.Asignada) {
      return Result.err(new DomainError("NECESIDAD_INVALIDA", "Esta necesidad ya esta siendo atendida"));
    }

    if (necesidad.estado !== EstadoNecesidad.Abierta) {
      return Result.err(new DomainError("NECESIDAD_INVALIDA", "La necesidad ya no esta activa"));
    }

    const now = new Date();
    if (necesidad.caducaEn.getTime() <= now.getTime()) {
      return Result.err(new DomainError("NECESIDAD_INVALIDA", "La necesidad ya no esta activa"));
    }

    const asignada = await this.necesidades.asignarSiAbierta(necesidad.id, now);
    if (!asignada) {
      return Result.err(new DomainError("NECESIDAD_INVALIDA", "Esta necesidad ya esta siendo atendida"));
    }

    return Result.ok(this.notificador.generarContacto(necesidad));
  }
}
