import { DomainError } from "../errors/DomainError";
import { Habilidad } from "../value-objects/Habilidad";
import { TelefonoVE } from "../value-objects/TelefonoVE";
import { Urgencia } from "../value-objects/Urgencia";
import { Zona } from "../value-objects/Zona";
import { Result, type Result as ResultType } from "../../shared/Result";

export enum EstadoNecesidad {
  Abierta = "ABIERTA",
  Asignada = "ASIGNADA",
  Resuelta = "RESUELTA",
  Cancelada = "CANCELADA",
  Expirada = "EXPIRADA",
}

export class Necesidad {
  private constructor(
    readonly id: string,
    readonly titulo: string,
    readonly descripcion: string,
    readonly habilidad: Habilidad,
    readonly urgencia: Urgencia,
    readonly estado: EstadoNecesidad,
    readonly zona: Zona,
    readonly contacto: TelefonoVE,
    readonly tokenGestion: string,
    readonly caducaEn: Date,
    readonly creadoEn: Date,
  ) {}

  static crear(params: {
    readonly id: string;
    readonly titulo: string;
    readonly descripcion: string;
    readonly habilidad: Habilidad;
    readonly urgencia: Urgencia;
    readonly estado?: EstadoNecesidad;
    readonly zona: Zona;
    readonly contacto: TelefonoVE;
    readonly tokenGestion: string;
    readonly caducaEn: Date;
    readonly creadoEn?: Date;
  }): ResultType<Necesidad, DomainError> {
    if (
      params.id.trim().length === 0 ||
      params.titulo.trim().length === 0 ||
      params.descripcion.trim().length === 0 ||
      params.tokenGestion.trim().length === 0 ||
      params.caducaEn.getTime() <= (params.creadoEn ?? new Date()).getTime()
    ) {
      return Result.err(new DomainError("NECESIDAD_INVALIDA", "Necesidad invalida"));
    }

    return Result.ok(
      new Necesidad(
        params.id,
        params.titulo.trim(),
        params.descripcion.trim(),
        params.habilidad,
        params.urgencia,
        params.estado ?? EstadoNecesidad.Abierta,
        params.zona,
        params.contacto,
        params.tokenGestion,
        params.caducaEn,
        params.creadoEn ?? new Date(),
      ),
    );
  }
}
