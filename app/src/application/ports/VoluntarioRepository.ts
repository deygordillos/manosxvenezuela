import { EstadoVoluntario, Voluntario } from "../../domain/entities/Voluntario";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { Zona } from "../../domain/value-objects/Zona";

export type CriterioMatch = {
  readonly habilidad: Habilidad;
  readonly estado: EstadoVoluntario;
  readonly centro: Zona;
};

export interface VoluntarioRepository {
  guardar(voluntario: Voluntario): Promise<void>;
  buscarPorTokenGestion(tokenGestion: string): Promise<Voluntario | null>;
  buscarCompatibles(criterio: CriterioMatch): Promise<Voluntario[]>;
  cambiarEstado(id: string, estado: EstadoVoluntario): Promise<void>;
}
