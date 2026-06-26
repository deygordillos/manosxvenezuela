import { z } from "zod";
import { NecesidadRepository } from "../../application/ports/NecesidadRepository";
import { VoluntarioRepository } from "../../application/ports/VoluntarioRepository";
import { ListarNecesidades } from "../../application/use-cases/ListarNecesidades";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { type HttpResponse } from "./voluntario";

export type ListadoRequest = {
  readonly now: number;
  readonly query: {
    readonly zona?: string;
    readonly habilidad?: string;
  };
};

export type ListadoHttpDeps = {
  readonly necesidades: NecesidadRepository;
  readonly voluntarios: VoluntarioRepository;
};

const listadoSchema = z.object({
  zona: z.string().trim().min(1).optional(),
  habilidad: z.nativeEnum(Habilidad).optional(),
});

export async function getNecesidades(
  request: ListadoRequest,
  deps: ListadoHttpDeps,
): Promise<HttpResponse> {
  const parsed = listadoSchema.safeParse(request.query);
  if (!parsed.success) {
    return { status: 400, body: { error: "Filtros invalidos." } };
  }

  const result = await new ListarNecesidades(deps.necesidades, deps.voluntarios).ejecutar(
    new Date(request.now),
    parsed.data,
  );

  return {
    status: 200,
    body: {
      estadoPulso: result.estadoPulso,
      necesidades: result.necesidades.map((necesidad) => ({
        id: necesidad.id,
        titulo: necesidad.titulo,
        descripcion: necesidad.descripcion,
        habilidad: necesidad.habilidad,
        urgencia: necesidad.urgencia,
        zona: necesidad.zona.estadoGeo,
        antiguedadMin: Math.max(0, Math.floor((request.now - necesidad.creadoEn.getTime()) / 60000)),
      })),
    },
  };
}
