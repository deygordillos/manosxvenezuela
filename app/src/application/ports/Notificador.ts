import { Necesidad } from "../../domain/entities/Necesidad";

export type EnlaceContacto = {
  readonly url: string;
};

export interface Notificador {
  generarContacto(necesidad: Necesidad): EnlaceContacto;
}
