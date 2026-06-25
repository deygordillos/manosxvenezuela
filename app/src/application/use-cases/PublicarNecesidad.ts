import { Necesidad } from "../../domain/entities/Necesidad";
import { Voluntario } from "../../domain/entities/Voluntario";
import { type DomainError } from "../../domain/errors/DomainError";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { TelefonoVE } from "../../domain/value-objects/TelefonoVE";
import { Urgencia } from "../../domain/value-objects/Urgencia";
import { Zona } from "../../domain/value-objects/Zona";
import { Result, type Result as ResultType } from "../../shared/Result";
import { NecesidadRepository } from "../ports/NecesidadRepository";
import { EmparejarVoluntarios } from "./EmparejarVoluntarios";

export type PublicarNecesidadInput = {
  readonly id: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly habilidad: Habilidad;
  readonly urgencia: Urgencia;
  readonly zona: Zona;
  readonly contacto: string;
  readonly creadoEn: Date;
};

export type PublicarNecesidadOutput = {
  readonly necesidad: Necesidad;
  readonly matches: readonly Voluntario[];
  readonly enlaceGestion: string;
};

export class PublicarNecesidad {
  constructor(
    private readonly necesidades: NecesidadRepository,
    private readonly emparejarVoluntarios: EmparejarVoluntarios,
    private readonly generarTokenGestion: () => string,
    private readonly crearEnlaceGestion: (tokenGestion: string) => string,
  ) {}

  async ejecutar(
    input: PublicarNecesidadInput,
  ): Promise<ResultType<PublicarNecesidadOutput, DomainError>> {
    const contacto = TelefonoVE.crear(input.contacto);
    if (!contacto.ok) {
      return Result.err(contacto.error);
    }

    const necesidad = Necesidad.crear({
      id: input.id,
      titulo: input.titulo,
      descripcion: input.descripcion,
      habilidad: input.habilidad,
      urgencia: input.urgencia,
      zona: input.zona,
      contacto: contacto.value,
      tokenGestion: this.generarTokenGestion(),
      creadoEn: input.creadoEn,
      caducaEn: new Date(input.creadoEn.getTime() + 48 * 60 * 60 * 1000),
    });

    if (!necesidad.ok) {
      return Result.err(necesidad.error);
    }

    await this.necesidades.guardar(necesidad.value);
    const matches = await this.emparejarVoluntarios.ejecutar(necesidad.value);
    if (!matches.ok) {
      return Result.err(matches.error);
    }

    return Result.ok({
      necesidad: necesidad.value,
      matches: matches.value,
      enlaceGestion: this.crearEnlaceGestion(necesidad.value.tokenGestion),
    });
  }
}
