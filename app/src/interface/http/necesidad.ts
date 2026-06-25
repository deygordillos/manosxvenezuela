import { z } from "zod";
import { AntiBot } from "../../application/ports/AntiBot";
import { NecesidadRepository } from "../../application/ports/NecesidadRepository";
import { RateLimiter } from "../../application/ports/RateLimiter";
import { VoluntarioRepository } from "../../application/ports/VoluntarioRepository";
import { CerrarNecesidad } from "../../application/use-cases/CerrarNecesidad";
import { EmparejarVoluntarios } from "../../application/use-cases/EmparejarVoluntarios";
import { PublicarNecesidad } from "../../application/use-cases/PublicarNecesidad";
import { EstadoNecesidad } from "../../domain/entities/Necesidad";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { TelefonoVE } from "../../domain/value-objects/TelefonoVE";
import { Urgencia } from "../../domain/value-objects/Urgencia";
import { Geohash } from "../../domain/value-objects/Geohash";
import { buscarZonaPorEstadoGeo } from "../../shared/municipios";
import { type HttpRequest, type HttpResponse } from "./voluntario";

const necesidadSchema = z.object({
  titulo: z.string().trim().min(3).max(90),
  descripcion: z.string().trim().min(5).max(600),
  habilidad: z.nativeEnum(Habilidad),
  estadoGeo: z.string().trim().min(1),
  urgencia: z.nativeEnum(Urgencia),
  contacto: z.string().trim().min(1),
  honeypot: z.string().max(0),
  ts: z.number().int().positive(),
  turnstileToken: z.string().trim().min(1),
});

const cierreSchema = z.object({
  tokenGestion: z.string().trim().min(32),
  estado: z.union([z.literal(EstadoNecesidad.Resuelta), z.literal(EstadoNecesidad.Cancelada)]),
});

export type NecesidadHttpDeps = {
  readonly necesidades: NecesidadRepository;
  readonly voluntarios: VoluntarioRepository;
  readonly antiBot: AntiBot;
  readonly rateLimiter: RateLimiter;
  readonly generarId: () => string;
  readonly generarTokenGestion: () => string;
  readonly baseUrl: string;
};

export async function postNecesidad(
  request: HttpRequest,
  deps: NecesidadHttpDeps,
): Promise<HttpResponse> {
  const rateLimit = await deps.rateLimiter.consumir(request.ip);
  if (!rateLimit.allowed) {
    return { status: 429, body: { error: "Demasiadas publicaciones. Intenta mas tarde." } };
  }

  const parsed = necesidadSchema.safeParse(request.body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Revisa los datos de la necesidad." } };
  }

  if (request.now - parsed.data.ts < 2000) {
    return { status: 400, body: { error: "Espera unos segundos antes de enviar." } };
  }

  const antiBot = await deps.antiBot.verificar(parsed.data.turnstileToken, request.ip);
  if (!antiBot.success) {
    return { status: 400, body: { error: "No pudimos verificar que eres una persona." } };
  }

  const contacto = TelefonoVE.crear(parsed.data.contacto);
  if (!contacto.ok) {
    return { status: 400, body: { error: "Ese numero no parece venezolano. Revisa el formato +58." } };
  }

  const activas = await deps.necesidades.contarActivasPorContacto(contacto.value, new Date(request.now));
  if (activas >= 3) {
    return { status: 400, body: { error: "Ese telefono ya tiene 3 necesidades activas." } };
  }

  const zona = buscarZonaPorEstadoGeo(parsed.data.estadoGeo);
  if (zona === null) {
    return { status: 400, body: { error: "Selecciona un municipio valido." } };
  }

  const result = await new PublicarNecesidad(
    deps.necesidades,
    new EmparejarVoluntarios(deps.voluntarios),
    deps.generarTokenGestion,
    (tokenGestion) => `${deps.baseUrl}/necesidad/gestion?token=${tokenGestion}`,
  ).ejecutar({
    id: deps.generarId(),
    titulo: parsed.data.titulo,
    descripcion: parsed.data.descripcion,
    habilidad: parsed.data.habilidad,
    urgencia: parsed.data.urgencia,
    zona,
    contacto: parsed.data.contacto,
    creadoEn: new Date(request.now),
  });

  if (!result.ok) {
    return { status: 400, body: { error: "No se pudo publicar la necesidad." } };
  }

  return {
    status: 201,
    body: {
      id: result.value.necesidad.id,
      estado: result.value.necesidad.estado,
      caducaEn: result.value.necesidad.caducaEn.toISOString(),
      enlaceGestion: result.value.enlaceGestion,
      matches: result.value.matches.map((voluntario) => ({
        id: voluntario.id,
        nombre: voluntario.nombre,
        distanciaKm: Math.round(Geohash.distanciaKm(voluntario.zona, result.value.necesidad.zona) * 10) / 10,
        contactoWhatsapp: `https://wa.me/${voluntario.telefono.value.slice(1)}`,
      })),
    },
  };
}

export async function patchNecesidadEstado(
  request: HttpRequest,
  deps: Pick<NecesidadHttpDeps, "necesidades">,
): Promise<HttpResponse> {
  const parsed = cierreSchema.safeParse(request.body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Revisa los datos del formulario." } };
  }

  const result = await new CerrarNecesidad(deps.necesidades).ejecutar(parsed.data);
  if (!result.ok) {
    return { status: 404, body: { error: "Enlace de gestion invalido." } };
  }

  return { status: 200, body: { id: result.value.id, estado: result.value.estado } };
}
