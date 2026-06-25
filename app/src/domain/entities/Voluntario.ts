import { DomainError } from "../errors/DomainError";
import { Habilidad } from "../value-objects/Habilidad";
import { TelefonoVE } from "../value-objects/TelefonoVE";
import { Zona } from "../value-objects/Zona";
import { Result, type Result as ResultType } from "../../shared/Result";

export enum EstadoVoluntario {
  Disponible = "DISPONIBLE",
  Ocupado = "OCUPADO",
  Inactivo = "INACTIVO",
}

export class Voluntario {
  private constructor(
    readonly id: string,
    readonly nombre: string,
    readonly telefono: TelefonoVE,
    readonly habilidades: ReadonlySet<Habilidad>,
    readonly estado: EstadoVoluntario,
    readonly zona: Zona,
    readonly radioKm: number,
    readonly tokenGestion: string,
    readonly creadoEn: Date,
  ) {}

  static crear(params: {
    readonly id: string;
    readonly nombre: string;
    readonly telefono: TelefonoVE;
    readonly habilidades: readonly Habilidad[];
    readonly estado?: EstadoVoluntario;
    readonly zona: Zona;
    readonly radioKm?: number;
    readonly tokenGestion: string;
    readonly creadoEn?: Date;
  }): ResultType<Voluntario, DomainError> {
    const estado = params.estado ?? EstadoVoluntario.Disponible;
    const radioKm = params.radioKm ?? 15;
    const habilidades = new Set(params.habilidades);

    if (
      params.id.trim().length === 0 ||
      params.nombre.trim().length === 0 ||
      params.tokenGestion.trim().length === 0 ||
      habilidades.size === 0 ||
      !Number.isFinite(radioKm) ||
      radioKm <= 0
    ) {
      return Result.err(new DomainError("VOLUNTARIO_INVALIDO", "Voluntario invalido"));
    }

    return Result.ok(
      new Voluntario(
        params.id,
        params.nombre.trim(),
        params.telefono,
        habilidades,
        estado,
        params.zona,
        radioKm,
        params.tokenGestion,
        params.creadoEn ?? new Date(),
      ),
    );
  }

  tieneHabilidad(habilidad: Habilidad): boolean {
    return this.habilidades.has(habilidad);
  }
}
