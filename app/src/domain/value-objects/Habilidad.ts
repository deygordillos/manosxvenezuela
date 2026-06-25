import { HabilidadInvalida, type DomainError } from "../errors/DomainError";
import { Result, type Result as ResultType } from "../../shared/Result";

export enum Habilidad {
  RescateUrbano = "rescate_urbano",
  Medico = "medico",
  Paramedico = "paramedico",
  Enfermeria = "enfermeria",
  IngenieriaEstructural = "ingenieria_estructural",
  PsicologiaPrimerosAuxilios = "psicologia_primeros_auxilios",
  Transporte = "transporte",
  Logistica = "logistica",
  Comunicaciones = "comunicaciones",
  VoluntarioGeneral = "voluntario_general",
}

const HABILIDADES = new Set<string>(Object.values(Habilidad));

export function parseHabilidad(value: string): ResultType<Habilidad, DomainError> {
  if (!HABILIDADES.has(value)) {
    return Result.err(new HabilidadInvalida(value));
  }

  return Result.ok(value as Habilidad);
}
