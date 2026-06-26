import { z } from "zod";
import { NecesidadRepository } from "../../application/ports/NecesidadRepository";
import { GenerarContactoWhatsapp } from "../../application/use-cases/GenerarContactoWhatsapp";
import { WhatsappLinkNotifier } from "../../infrastructure/notifications/WhatsappLinkNotifier";
import { type HttpResponse } from "./voluntario";

export type ContactoRequest = {
  readonly params: {
    readonly necesidadId: string;
  };
};

export type ContactoHttpDeps = {
  readonly necesidades: NecesidadRepository;
};

const contactoSchema = z.object({
  necesidadId: z.string().trim().min(1),
});

export async function postContacto(
  request: ContactoRequest,
  deps: ContactoHttpDeps,
): Promise<HttpResponse> {
  const parsed = contactoSchema.safeParse(request.params);
  if (!parsed.success) {
    return { status: 400, body: { error: "Necesidad invalida." } };
  }

  const result = await new GenerarContactoWhatsapp(
    deps.necesidades,
    new WhatsappLinkNotifier(),
  ).ejecutar(parsed.data.necesidadId);

  if (!result.ok) {
    return { status: 409, body: { error: "Esta necesidad ya no esta activa." } };
  }

  return { status: 200, body: { url: result.value.url } };
}
