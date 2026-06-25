import test from "node:test";
import assert from "node:assert/strict";
import { AntiBot } from "../../../src/application/ports/AntiBot";
import { RateLimiter } from "../../../src/application/ports/RateLimiter";
import { EstadoNecesidad, Necesidad } from "../../../src/domain/entities/Necesidad";
import { EstadoVoluntario, Voluntario } from "../../../src/domain/entities/Voluntario";
import { Habilidad } from "../../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../../src/domain/value-objects/TelefonoVE";
import { Urgencia } from "../../../src/domain/value-objects/Urgencia";
import { Zona } from "../../../src/domain/value-objects/Zona";
import { postNecesidad, patchNecesidadEstado } from "../../../src/interface/http/necesidad";
import { InMemoryNecesidadRepository } from "../../InMemoryNecesidadRepository";
import { InMemoryVoluntarioRepository } from "../../InMemoryVoluntarioRepository";

const okAntiBot: AntiBot = { verificar: async () => ({ success: true }) };
const okRateLimiter: RateLimiter = { consumir: async () => ({ allowed: true }) };

test("CA-1 y CA-2 publica necesidad y devuelve matches", async () => {
  const response = await postNecesidad(
    { ip: "127.0.0.1", now: Date.parse("2026-06-25T10:00:00.000Z"), body: bodyValido() },
    deps({ voluntarios: new InMemoryVoluntarioRepository([crearVoluntario()]) }),
  );

  assert.equal(response.status, 201);
  assert.deepEqual(response.body, {
    id: "nec-1",
    estado: EstadoNecesidad.Abierta,
    caducaEn: "2026-06-27T10:00:00.000Z",
    enlaceGestion: "https://manos.test/necesidad/gestion?token=12345678901234567890123456789012",
    matches: [
      {
        id: "vol-1",
        nombre: "Ana Perez",
        distanciaKm: 5,
        contactoWhatsapp: "https://wa.me/584121234567",
      },
    ],
  });
});

test("CA-3 publica sin coincidencias", async () => {
  const response = await postNecesidad(
    { ip: "127.0.0.1", now: Date.parse("2026-06-25T10:00:00.000Z"), body: bodyValido() },
    deps(),
  );

  assert.equal(response.status, 201);
  assert.deepEqual((response.body as { readonly matches: readonly unknown[] }).matches, []);
});

test("CA-4 rechaza Turnstile fallido", async () => {
  const response = await postNecesidad(
    { ip: "127.0.0.1", now: 3000, body: bodyValido() },
    deps({ antiBot: { verificar: async () => ({ success: false }) } }),
  );

  assert.equal(response.status, 400);
});

test("CA-4 rechaza rate limit por IP", async () => {
  const response = await postNecesidad(
    { ip: "127.0.0.1", now: 3000, body: bodyValido() },
    deps({ rateLimiter: { consumir: async () => ({ allowed: false }) } }),
  );

  assert.equal(response.status, 429);
});

test("CA-4 rechaza mas de 3 necesidades activas por telefono", async () => {
  const necesidades = new InMemoryNecesidadRepository([
    crearNecesidad("a"),
    crearNecesidad("b"),
    crearNecesidad("c"),
  ]);
  const response = await postNecesidad(
    { ip: "127.0.0.1", now: Date.parse("2026-06-25T10:00:00.000Z"), body: bodyValido() },
    deps({ necesidades }),
  );

  assert.equal(response.status, 400);
});

test("CA-5 cierra necesidad con token de gestion", async () => {
  const necesidades = new InMemoryNecesidadRepository([crearNecesidad("nec-1")]);
  const response = await patchNecesidadEstado(
    {
      ip: "127.0.0.1",
      now: 4000,
      body: { tokenGestion: "12345678901234567890123456789012", estado: EstadoNecesidad.Cancelada },
    },
    { necesidades },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { id: "nec-1", estado: EstadoNecesidad.Cancelada });
});

function bodyValido(): Record<string, unknown> {
  return {
    titulo: "Atencion medica",
    descripcion: "Se requiere apoyo medico",
    habilidad: Habilidad.Medico,
    estadoGeo: "Distrito Capital/Caracas",
    urgencia: Urgencia.Critica,
    contacto: "+584221234567",
    honeypot: "",
    ts: 500,
    turnstileToken: "turnstile-ok",
  };
}

function deps(overrides: Partial<Parameters<typeof postNecesidad>[1]> = {}): Parameters<typeof postNecesidad>[1] {
  return {
    necesidades: new InMemoryNecesidadRepository(),
    voluntarios: new InMemoryVoluntarioRepository(),
    antiBot: okAntiBot,
    rateLimiter: okRateLimiter,
    generarId: () => "nec-1",
    generarTokenGestion: () => "12345678901234567890123456789012",
    baseUrl: "https://manos.test",
    ...overrides,
  };
}

function crearVoluntario(): Voluntario {
  const telefono = TelefonoVE.crear("+584121234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.544, lng: -66.93 });
  assert.equal(telefono.ok, true);
  assert.equal(zona.ok, true);
  if (!telefono.ok || !zona.ok) throw new Error("Fixture invalido");

  const voluntario = Voluntario.crear({
    id: "vol-1",
    nombre: "Ana Perez",
    telefono: telefono.value,
    habilidades: [Habilidad.Medico],
    estado: EstadoVoluntario.Disponible,
    zona: zona.value,
    radioKm: 15,
    tokenGestion: "token-vol-1",
  });
  assert.equal(voluntario.ok, true);
  if (!voluntario.ok) throw new Error("Fixture invalido");

  return voluntario.value;
}

function crearNecesidad(id: string): Necesidad {
  const contacto = TelefonoVE.crear("+584221234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.499, lng: -66.93 });
  assert.equal(contacto.ok, true);
  assert.equal(zona.ok, true);
  if (!contacto.ok || !zona.ok) throw new Error("Fixture invalido");

  const necesidad = Necesidad.crear({
    id,
    titulo: "Atencion medica",
    descripcion: "Se requiere apoyo medico",
    habilidad: Habilidad.Medico,
    urgencia: Urgencia.Alta,
    zona: zona.value,
    contacto: contacto.value,
    tokenGestion: "12345678901234567890123456789012",
    creadoEn: new Date("2026-06-25T10:00:00.000Z"),
    caducaEn: new Date("2026-06-27T10:00:00.000Z"),
  });
  assert.equal(necesidad.ok, true);
  if (!necesidad.ok) throw new Error("Fixture invalido");

  return necesidad.value;
}
