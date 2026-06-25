import { EstadoVoluntario, Voluntario } from "../../domain/entities/Voluntario";
import { DomainError } from "../../domain/errors/DomainError";
import { Result, type Result as ResultType } from "../../shared/Result";
import { VoluntarioRepository } from "../ports/VoluntarioRepository";

export class CambiarDisponibilidad {
  constructor(private readonly repo: VoluntarioRepository) {}

  async ejecutar(params: {
    readonly tokenGestion: string;
    readonly estado: EstadoVoluntario;
  }): Promise<ResultType<Voluntario, DomainError>> {
    const voluntario = await this.repo.buscarPorTokenGestion(params.tokenGestion);
    if (voluntario === null) {
      return Result.err(new DomainError("VOLUNTARIO_INVALIDO", "Token de gestion invalido"));
    }

    await this.repo.cambiarEstado(voluntario.id, params.estado);
    const actualizado = await this.repo.buscarPorTokenGestion(params.tokenGestion);
    if (actualizado === null) {
      return Result.err(new DomainError("VOLUNTARIO_INVALIDO", "No se pudo actualizar el voluntario"));
    }

    return Result.ok(actualizado);
  }
}
