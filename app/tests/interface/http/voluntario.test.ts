import test from "node:test";
import assert from "node:assert/strict";
import { AntiBot } from "../../../src/application/ports/AntiBot";
import { RateLimiter } from "../../../src/application/ports/RateLimiter";
import { EstadoVoluntario } from "../../../src/domain/entities/Voluntario";
import { Habilidad } from "../../../src/domain/value-objects/Habilidad";
import { postVoluntario, patchVoluntarioEstado } from "../../../src/interface/http/voluntario";
import { InMemoryVoluntarioRepository } from "../../InMemoryVoluntarioRepository";

const okAntiBot: AntiBot = { verificar: async () => ({ success: true }) };
const okRateLimiter: RateLimiter = { consumir: async () => ({ allowed: true }) };

test("CA-1 POST /api/voluntario crea perfil disponible", async () => {
  const repo = new InMemoryVoluntarioRepository();
  const response = await postVoluntario(
    { ip: "127.0.0.1", now: 3000, body: bodyValido() },
    {
      repo,
      antiBot: okAntiBot,
      rateLimiter: okRateLimiter,
      generarId: () => "vol-1",
      generarTokenGestion: () => "12345678901234567890123456789012",
      baseUrl: "https://manos.test",
    },
  );

  assert.equal(response.status, 201);
  assert.deepEqual(response.body, {
    id: "vol-1",
    estado: EstadoVoluntario.Disponible,
    enlaceGestion: "https://manos.test/voluntario/gestion?token=12345678901234567890123456789012",
  });
});

test("CA-2 telefono invalido devuelve copy esperado", async () => {
  const response = await postVoluntario(
    { ip: "127.0.0.1", now: 3000, body: { ...bodyValido(), telefono: "+581231234567" } },
    deps(),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "Ese numero no parece venezolano. Revisa el formato +58." });
});

test("CA-3 rechaza Turnstile fallido", async () => {
  const response = await postVoluntario(
    { ip: "127.0.0.1", now: 3000, body: bodyValido() },
    deps({ antiBot: { verificar: async () => ({ success: false }) } }),
  );

  assert.equal(response.status, 400);
});

test("CA-3 rechaza time-trap menor a 2 segundos", async () => {
  const response = await postVoluntario(
    { ip: "127.0.0.1", now: 1500, body: bodyValido() },
    deps(),
  );

  assert.equal(response.status, 400);
});

test("CA-4 rate limit devuelve 429", async () => {
  const response = await postVoluntario(
    { ip: "127.0.0.1", now: 3000, body: bodyValido() },
    deps({ rateLimiter: { consumir: async () => ({ allowed: false }) } }),
  );

  assert.equal(response.status, 429);
});

test("CA-5 PATCH /api/voluntario/estado cambia a ocupado", async () => {
  const repo = new InMemoryVoluntarioRepository();
  await postVoluntario(
    { ip: "127.0.0.1", now: 3000, body: bodyValido() },
    deps({ repo }),
  );

  const response = await patchVoluntarioEstado(
    {
      ip: "127.0.0.1",
      now: 4000,
      body: { tokenGestion: "12345678901234567890123456789012", estado: EstadoVoluntario.Ocupado },
    },
    { repo },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { id: "vol-1", estado: EstadoVoluntario.Ocupado });
});

function bodyValido(): Record<string, unknown> {
  return {
    nombre: "Ana Perez",
    telefono: "+584221234567",
    habilidades: [Habilidad.Medico],
    estadoGeo: "Distrito Capital/Caracas",
    radioKm: 15,
    honeypot: "",
    ts: 500,
    turnstileToken: "turnstile-ok",
  };
}

function deps(overrides: Partial<Parameters<typeof postVoluntario>[1]> = {}): Parameters<typeof postVoluntario>[1] {
  return {
    repo: new InMemoryVoluntarioRepository(),
    antiBot: okAntiBot,
    rateLimiter: okRateLimiter,
    generarId: () => "vol-1",
    generarTokenGestion: () => "12345678901234567890123456789012",
    baseUrl: "https://manos.test",
    ...overrides,
  };
}
