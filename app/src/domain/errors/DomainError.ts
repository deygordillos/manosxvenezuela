export type DomainErrorCode =
  | "TELEFONO_INVALIDO"
  | "HABILIDAD_INVALIDA"
  | "URGENCIA_INVALIDA"
  | "ZONA_INVALIDA"
  | "VOLUNTARIO_INVALIDO"
  | "NECESIDAD_INVALIDA"
  | "MATCH_INVALIDO";

export class DomainError {
  constructor(
    readonly code: DomainErrorCode,
    readonly message: string,
  ) {}
}

export class TelefonoInvalido extends DomainError {
  constructor(telefono: string) {
    super("TELEFONO_INVALIDO", `Telefono VE invalido: ${telefono}`);
  }
}

export class HabilidadInvalida extends DomainError {
  constructor(habilidad: string) {
    super("HABILIDAD_INVALIDA", `Habilidad invalida: ${habilidad}`);
  }
}
