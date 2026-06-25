import { Voluntario } from "../../domain/entities/Voluntario";
import { type DomainError } from "../../domain/errors/DomainError";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { TelefonoVE } from "../../domain/value-objects/TelefonoVE";
import { Zona } from "../../domain/value-objects/Zona";
import { Result, type Result as ResultType } from "../../shared/Result";
import { VoluntarioRepository } from "../ports/VoluntarioRepository";

export type RegistrarVoluntarioInput = {
  readonly id: string;
  readonly nombre: string;
  readonly telefono: string;
  readonly habilidades: readonly Habilidad[];
  readonly zona: Zona;
  readonly radioKm: number;
  readonly creadoEn?: Date;
};

export type RegistrarVoluntarioOutput = {
  readonly voluntario: Voluntario;
  readonly enlaceGestion: string;
};

export class RegistrarVoluntario {
  constructor(
    private readonly repo: VoluntarioRepository,
    private readonly generarTokenGestion: () => string,
    private readonly crearEnlaceGestion: (tokenGestion: string) => string,
  ) {}

  async ejecutar(
    input: RegistrarVoluntarioInput,
  ): Promise<ResultType<RegistrarVoluntarioOutput, DomainError>> {
    const telefono = TelefonoVE.crear(input.telefono);
    if (!telefono.ok) {
      return Result.err(telefono.error);
    }

    const tokenGestion = this.generarTokenGestion();
    const voluntario = Voluntario.crear({
      id: input.id,
      nombre: input.nombre,
      telefono: telefono.value,
      habilidades: input.habilidades,
      zona: input.zona,
      radioKm: input.radioKm,
      tokenGestion,
      creadoEn: input.creadoEn,
    });

    if (!voluntario.ok) {
      return Result.err(voluntario.error);
    }

    await this.repo.guardar(voluntario.value);

    return Result.ok({
      voluntario: voluntario.value,
      enlaceGestion: this.crearEnlaceGestion(tokenGestion),
    });
  }
}
