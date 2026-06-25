import { DomainError } from "../errors/DomainError";
import { Result, type Result as ResultType } from "../../shared/Result";
import { Geohash } from "./Geohash";

export class Zona {
  private constructor(
    readonly estadoGeo: string,
    readonly lat: number,
    readonly lng: number,
    readonly geohash: string,
  ) {}

  static crear(params: {
    readonly estadoGeo: string;
    readonly lat: number;
    readonly lng: number;
  }): ResultType<Zona, DomainError> {
    const estadoGeo = params.estadoGeo.trim();
    const coordenadasValidas =
      Number.isFinite(params.lat) &&
      Number.isFinite(params.lng) &&
      params.lat >= -90 &&
      params.lat <= 90 &&
      params.lng >= -180 &&
      params.lng <= 180;

    if (estadoGeo.length === 0 || !coordenadasValidas) {
      return Result.err(new DomainError("ZONA_INVALIDA", "Zona invalida"));
    }

    return Result.ok(new Zona(estadoGeo, params.lat, params.lng, Geohash.encode(params.lat, params.lng)));
  }
}
