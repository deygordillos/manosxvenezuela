import { DomainError } from "../errors/DomainError";
import { Result, type Result as ResultType } from "../../shared/Result";

export enum Urgencia {
  Critica = "CRITICA",
  Alta = "ALTA",
  Media = "MEDIA",
}

export function pesoUrgencia(urgencia: Urgencia): number {
  switch (urgencia) {
    case Urgencia.Critica:
      return 3;
    case Urgencia.Alta:
      return 2;
    case Urgencia.Media:
      return 1;
  }
}

export function parseUrgencia(value: string): ResultType<Urgencia, DomainError> {
  if (value === Urgencia.Critica || value === Urgencia.Alta || value === Urgencia.Media) {
    return Result.ok(value);
  }

  return Result.err(new DomainError("URGENCIA_INVALIDA", `Urgencia invalida: ${value}`));
}
