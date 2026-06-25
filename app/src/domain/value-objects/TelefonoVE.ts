import { TelefonoInvalido, type DomainError } from "../errors/DomainError";
import { Result, type Result as ResultType } from "../../shared/Result";

const TELEFONO_VE_REGEX = /^\+58(412|414|415|416|422|424|426|2\d{2})\d{7}$/;

export class TelefonoVE {
  private constructor(readonly value: string) {}

  static crear(value: string): ResultType<TelefonoVE, DomainError> {
    if (!TELEFONO_VE_REGEX.test(value)) {
      return Result.err(new TelefonoInvalido(value));
    }

    return Result.ok(new TelefonoVE(value));
  }
}
