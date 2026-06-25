import { z } from "zod";
import { AntiBot } from "../../application/ports/AntiBot";
import { RateLimiter } from "../../application/ports/RateLimiter";
import { VoluntarioRepository } from "../../application/ports/VoluntarioRepository";
import { CambiarDisponibilidad } from "../../application/use-cases/CambiarDisponibilidad";
import { RegistrarVoluntario } from "../../application/use-cases/RegistrarVoluntario";
import { EstadoVoluntario } from "../../domain/entities/Voluntario";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { buscarZonaPorEstadoGeo } from "../../shared/municipios";

export type HttpRequest = {
  readonly ip: string;
  readonly body: unknown;
  readonly now: number;
};

export type HttpResponse = {
  readonly status: number;
  readonly body: unknown;
};

const registroSchema = z.object({
  nombre: z.string().trim().min(2),
  telefono: z.string().trim().min(1),
  habilidades: z.array(z.nativeEnum(Habilidad)).min(1),
  estadoGeo: z.string().trim().min(1),
  radioKm: z.number().int().min(1).max(100),
  honeypot: z.string().max(0),
  ts: z.number().int().positive(),
  turnstileToken: z.string().trim().min(1),
});

const estadoSchema = z.object({
  tokenGestion: z.string().trim().min(32),
  estado: z.nativeEnum(EstadoVoluntario),
});

export type VoluntarioHttpDeps = {
  readonly repo: VoluntarioRepository;
  readonly antiBot: AntiBot;
  readonly rateLimiter: RateLimiter;
  readonly generarId: () => string;
  readonly generarTokenGestion: () => string;
  readonly baseUrl: string;
};

export async function postVoluntario(
  request: HttpRequest,
  deps: VoluntarioHttpDeps,
): Promise<HttpResponse> {
  const rateLimit = await deps.rateLimiter.consumir(request.ip);
  if (!rateLimit.allowed) {
    return { status: 429, body: { error: "Demasiados registros. Intenta mas tarde." } };
  }

  const parsed = registroSchema.safeParse(request.body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Revisa los datos del formulario." } };
  }

  if (request.now - parsed.data.ts < 2000) {
    return { status: 400, body: { error: "Espera unos segundos antes de enviar." } };
  }

  const antiBot = await deps.antiBot.verificar(parsed.data.turnstileToken, request.ip);
  if (!antiBot.success) {
    return { status: 400, body: { error: "No pudimos verificar que eres una persona." } };
  }

  const zona = buscarZonaPorEstadoGeo(parsed.data.estadoGeo);
  if (zona === null) {
    return { status: 400, body: { error: "Selecciona un municipio valido." } };
  }

  const useCase = new RegistrarVoluntario(
    deps.repo,
    deps.generarTokenGestion,
    (tokenGestion) => `${deps.baseUrl}/voluntario/gestion?token=${tokenGestion}`,
  );
  const result = await useCase.ejecutar({
    id: deps.generarId(),
    nombre: parsed.data.nombre,
    telefono: parsed.data.telefono,
    habilidades: parsed.data.habilidades,
    zona,
    radioKm: parsed.data.radioKm,
    creadoEn: new Date(request.now),
  });

  if (!result.ok) {
    const error =
      result.error.code === "TELEFONO_INVALIDO"
        ? "Ese numero no parece venezolano. Revisa el formato +58."
        : "No se pudo crear el perfil.";
    return { status: 400, body: { error } };
  }

  return {
    status: 201,
    body: {
      id: result.value.voluntario.id,
      estado: result.value.voluntario.estado,
      enlaceGestion: result.value.enlaceGestion,
    },
  };
}

export async function patchVoluntarioEstado(
  request: HttpRequest,
  deps: Pick<VoluntarioHttpDeps, "repo">,
): Promise<HttpResponse> {
  const parsed = estadoSchema.safeParse(request.body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Revisa los datos del formulario." } };
  }

  const result = await new CambiarDisponibilidad(deps.repo).ejecutar(parsed.data);
  if (!result.ok) {
    return { status: 404, body: { error: "Enlace de gestion invalido." } };
  }

  return { status: 200, body: { id: result.value.id, estado: result.value.estado } };
}
