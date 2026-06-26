import { EstadoNecesidad, Necesidad } from "../../domain/entities/Necesidad";
import { TelefonoVE } from "../../domain/value-objects/TelefonoVE";

export interface NecesidadRepository {
  guardar(necesidad: Necesidad): Promise<void>;
  buscarPorId(id: string): Promise<Necesidad | null>;
  buscarPorTokenGestion(tokenGestion: string): Promise<Necesidad | null>;
  contarActivasPorContacto(contacto: TelefonoVE, now: Date): Promise<number>;
  cambiarEstado(id: string, estado: EstadoNecesidad): Promise<void>;
  expirarVencidas(now: Date): Promise<number>;
  listarAbiertasVigentes(now: Date): Promise<Necesidad[]>;
  listarPorEstado(estado: EstadoNecesidad, now: Date): Promise<Necesidad[]>;
}
