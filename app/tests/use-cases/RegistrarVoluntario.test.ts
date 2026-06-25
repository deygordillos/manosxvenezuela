import test from "node:test";
import assert from "node:assert/strict";
import { RegistrarVoluntario } from "../../src/application/use-cases/RegistrarVoluntario";
import { Habilidad } from "../../src/domain/value-objects/Habilidad";
import { Zona } from "../../src/domain/value-objects/Zona";
import { InMemoryVoluntarioRepository } from "../InMemoryVoluntarioRepository";

test("registra voluntario disponible y devuelve enlace de gestion", async () => {
  const repo = new InMemoryVoluntarioRepository();
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.499, lng: -66.93 });
  assert.equal(zona.ok, true);
  if (!zona.ok) throw new Error("Fixture invalido");

  const result = await new RegistrarVoluntario(
    repo,
    () => "token-gestion-128bits",
    (token) => `https://manos.test/voluntario/gestion?token=${token}`,
  ).ejecutar({
    id: "vol-1",
    nombre: "Ana Perez",
    telefono: "+584221234567",
    habilidades: [Habilidad.Medico],
    zona: zona.value,
    radioKm: 15,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.voluntario.estado, "DISPONIBLE");
    assert.equal(result.value.enlaceGestion, "https://manos.test/voluntario/gestion?token=token-gestion-128bits");
    assert.equal(await repo.buscarPorTokenGestion("token-gestion-128bits"), result.value.voluntario);
  }
});

test("telefono invalido no se persiste", async () => {
  const repo = new InMemoryVoluntarioRepository();
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.499, lng: -66.93 });
  assert.equal(zona.ok, true);
  if (!zona.ok) throw new Error("Fixture invalido");

  const result = await new RegistrarVoluntario(
    repo,
    () => "token-gestion-128bits",
    (token) => `https://manos.test/voluntario/gestion?token=${token}`,
  ).ejecutar({
    id: "vol-1",
    nombre: "Ana Perez",
    telefono: "+581231234567",
    habilidades: [Habilidad.Medico],
    zona: zona.value,
    radioKm: 15,
  });

  assert.equal(result.ok, false);
  assert.equal(await repo.buscarPorTokenGestion("token-gestion-128bits"), null);
});
