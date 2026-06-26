import { z } from "zod";
import { NecesidadRepository } from "../../application/ports/NecesidadRepository";
import { renderGestionNecesidadPage } from "../web/GestionNecesidad";
import { type HttpResponse } from "./voluntario";

export type GestionNecesidadRequest = {
  readonly query: {
    readonly token?: string;
  };
};

export type GestionNecesidadDeps = {
  readonly necesidades: NecesidadRepository;
};

const gestionSchema = z.object({
  token: z.string().trim().min(32),
});

export async function getGestionNecesidad(
  request: GestionNecesidadRequest,
  deps: GestionNecesidadDeps,
): Promise<HttpResponse> {
  const parsed = gestionSchema.safeParse(request.query);
  if (!parsed.success) {
    return { status: 404, body: renderGestionNecesidadPage({ necesidad: null }) };
  }

  const necesidad = await deps.necesidades.buscarPorTokenGestion(parsed.data.token);
  if (necesidad === null) {
    return { status: 404, body: renderGestionNecesidadPage({ necesidad: null }) };
  }

  return {
    status: 200,
    body: renderGestionNecesidadPage({ necesidad, tokenGestion: parsed.data.token }),
  };
}
