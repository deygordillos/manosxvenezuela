import { z } from "zod";
import { VoluntarioRepository } from "../../application/ports/VoluntarioRepository";
import { renderGestionVoluntarioPage } from "../web/GestionVoluntario";
import { type HttpResponse } from "./voluntario";

export type GestionVoluntarioRequest = {
  readonly query: {
    readonly token?: string;
  };
};

export type GestionVoluntarioDeps = {
  readonly voluntarios: VoluntarioRepository;
};

const gestionSchema = z.object({
  token: z.string().trim().min(32),
});

export async function getGestionVoluntario(
  request: GestionVoluntarioRequest,
  deps: GestionVoluntarioDeps,
): Promise<HttpResponse> {
  const parsed = gestionSchema.safeParse(request.query);
  if (!parsed.success) {
    return { status: 404, body: renderGestionVoluntarioPage({ voluntario: null }) };
  }

  const voluntario = await deps.voluntarios.buscarPorTokenGestion(parsed.data.token);
  if (voluntario === null) {
    return { status: 404, body: renderGestionVoluntarioPage({ voluntario: null }) };
  }

  return {
    status: 200,
    body: renderGestionVoluntarioPage({ voluntario, tokenGestion: parsed.data.token }),
  };
}
