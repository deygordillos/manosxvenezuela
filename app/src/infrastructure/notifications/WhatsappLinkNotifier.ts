import { Necesidad } from "../../domain/entities/Necesidad";
import { type EnlaceContacto, type Notificador } from "../../application/ports/Notificador";

export class WhatsappLinkNotifier implements Notificador {
  generarContacto(necesidad: Necesidad): EnlaceContacto {
    const numero = necesidad.contacto.value.slice(1);
    const texto = encodeURIComponent(
      `Hola, soy voluntario de Manos. Vi tu necesidad "${necesidad.titulo}" en ${necesidad.zona.estadoGeo}. Como puedo ayudar?`,
    );

    return { url: `https://wa.me/${numero}?text=${texto}` };
  }
}
