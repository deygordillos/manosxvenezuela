import test from "node:test";
import assert from "node:assert/strict";
import { CerrarNecesidad } from "../../src/application/use-cases/CerrarNecesidad";
import { EstadoNecesidad, Necesidad } from "../../src/domain/entities/Necesidad";
import { Habilidad } from "../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../src/domain/value-objects/TelefonoVE";
import { Urgencia } from "../../src/domain/value-objects/Urgencia";
import { Zona } from "../../src/domain/value-objects/Zona";
import { InMemoryNecesidadRepository } from "../InMemoryNecesidadRepository";

test("cierra necesidad por token de gestion", async () => {
  const repo = new InMemoryNecesidadRepository([crearNecesidad()]);

  const result = await new CerrarNecesidad(repo).ejecutar({
    tokenGestion: "12345678901234567890123456789012",
    estado: EstadoNecesidad.Resuelta,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.estado, EstadoNecesidad.Resuelta);
  }
});

test("expira necesidades vencidas", async () => {
  const repo = new InMemoryNecesidadRepository([crearNecesidad()]);

  const total = await repo.expirarVencidas(new Date("2026-06-28T10:00:00.000Z"));
  const actualizada = await repo.buscarPorTokenGestion("12345678901234567890123456789012");

  assert.equal(total, 1);
  assert.equal(actualizada?.estado, EstadoNecesidad.Expirada);
});

function crearNecesidad(): Necesidad {
  const contacto = TelefonoVE.crear("+584221234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.499, lng: -66.93 });
  assert.equal(contacto.ok, true);
  assert.equal(zona.ok, true);
  if (!contacto.ok || !zona.ok) throw new Error("Fixture invalido");

  const necesidad = Necesidad.crear({
    id: "nec-1",
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
