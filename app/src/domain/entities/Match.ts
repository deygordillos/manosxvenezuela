import { DomainError } from "../errors/DomainError";
import { Result, type Result as ResultType } from "../../shared/Result";

export enum EstadoMatch {
  Propuesto = "PROPUESTO",
  Aceptado = "ACEPTADO",
  Completado = "COMPLETADO",
  Rechazado = "RECHAZADO",
}

export class Match {
  private constructor(
    readonly id: string,
    readonly necesidadId: string,
    readonly voluntarioId: string,
    readonly estado: EstadoMatch,
    readonly creadoEn: Date,
  ) {}

  static crear(params: {
    readonly id: string;
    readonly necesidadId: string;
    readonly voluntarioId: string;
    readonly estado?: EstadoMatch;
    readonly creadoEn?: Date;
  }): ResultType<Match, DomainError> {
    if (
      params.id.trim().length === 0 ||
      params.necesidadId.trim().length === 0 ||
      params.voluntarioId.trim().length === 0
    ) {
      return Result.err(new DomainError("MATCH_INVALIDO", "Match invalido"));
    }

    return Result.ok(
      new Match(
        params.id,
        params.necesidadId,
        params.voluntarioId,
        params.estado ?? EstadoMatch.Propuesto,
        params.creadoEn ?? new Date(),
      ),
    );
  }
}
