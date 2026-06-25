import { EstadoNecesidad, Necesidad } from "../../domain/entities/Necesidad";
import { DomainError } from "../../domain/errors/DomainError";
import { Result, type Result as ResultType } from "../../shared/Result";
import { NecesidadRepository } from "../ports/NecesidadRepository";

export class CerrarNecesidad {
  constructor(private readonly repo: NecesidadRepository) {}

  async ejecutar(params: {
    readonly tokenGestion: string;
    readonly estado: EstadoNecesidad.Resuelta | EstadoNecesidad.Cancelada;
  }): Promise<ResultType<Necesidad, DomainError>> {
    const necesidad = await this.repo.buscarPorTokenGestion(params.tokenGestion);
    if (necesidad === null) {
      return Result.err(new DomainError("NECESIDAD_INVALIDA", "Token de gestion invalido"));
    }

    await this.repo.cambiarEstado(necesidad.id, params.estado);
    const actualizada = await this.repo.buscarPorTokenGestion(params.tokenGestion);
    if (actualizada === null) {
      return Result.err(new DomainError("NECESIDAD_INVALIDA", "No se pudo actualizar la necesidad"));
    }

    return Result.ok(actualizada);
  }
}
