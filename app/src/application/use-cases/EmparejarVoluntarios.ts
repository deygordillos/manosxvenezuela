import { Necesidad } from "../../domain/entities/Necesidad";
import { EstadoVoluntario, Voluntario } from "../../domain/entities/Voluntario";
import { type DomainError } from "../../domain/errors/DomainError";
import { Geohash } from "../../domain/value-objects/Geohash";
import { Result, type Result as ResultType } from "../../shared/Result";
import { VoluntarioRepository } from "../ports/VoluntarioRepository";

export class EmparejarVoluntarios {
  constructor(private readonly repo: VoluntarioRepository) {}

  async ejecutar(necesidad: Necesidad): Promise<ResultType<Voluntario[], DomainError>> {
    const candidatos = await this.repo.buscarCompatibles({
      habilidad: necesidad.habilidad,
      estado: EstadoVoluntario.Disponible,
      centro: necesidad.zona,
    });

    const compatibles = candidatos.filter((voluntario) => {
      const distancia = Geohash.distanciaKm(voluntario.zona, necesidad.zona);
      return (
        voluntario.estado === EstadoVoluntario.Disponible &&
        voluntario.tieneHabilidad(necesidad.habilidad) &&
        distancia <= voluntario.radioKm
      );
    });

    compatibles.sort((a, b) => {
      const distanciaA = Geohash.distanciaKm(a.zona, necesidad.zona);
      const distanciaB = Geohash.distanciaKm(b.zona, necesidad.zona);
      if (distanciaA !== distanciaB) {
        return distanciaA - distanciaB;
      }

      return a.creadoEn.getTime() - b.creadoEn.getTime();
    });

    return Result.ok(compatibles);
  }
}
