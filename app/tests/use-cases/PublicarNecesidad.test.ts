import test from "node:test";
import assert from "node:assert/strict";
import { EmparejarVoluntarios } from "../../src/application/use-cases/EmparejarVoluntarios";
import { PublicarNecesidad } from "../../src/application/use-cases/PublicarNecesidad";
import { EstadoNecesidad, Necesidad } from "../../src/domain/entities/Necesidad";
import { EstadoVoluntario, Voluntario } from "../../src/domain/entities/Voluntario";
import { Habilidad } from "../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../src/domain/value-objects/TelefonoVE";
import { Urgencia } from "../../src/domain/value-objects/Urgencia";
import { Zona } from "../../src/domain/value-objects/Zona";
import { InMemoryNecesidadRepository } from "../InMemoryNecesidadRepository";
import { InMemoryVoluntarioRepository } from "../InMemoryVoluntarioRepository";

test("publica necesidad abierta con caducidad 48h y devuelve matches ordenados", async () => {
  const necesidades = new InMemoryNecesidadRepository();
  const voluntarios = new InMemoryVoluntarioRepository([
    crearVoluntario({ id: "lejano", lat: 10.571 }),
    crearVoluntario({ id: "cercano", lat: 10.526 }),
  ]);
  const zona = crearZona();
  const creadoEn = new Date("2026-06-25T10:00:00.000Z");

  const result = await new PublicarNecesidad(
    necesidades,
    new EmparejarVoluntarios(voluntarios),
    () => "token-necesidad",
    (token) => `https://manos.test/necesidad/gestion?token=${token}`,
  ).ejecutar({
    id: "nec-1",
    titulo: "Atencion medica",
    descripcion: "Se requiere apoyo medico",
    habilidad: Habilidad.Medico,
    urgencia: Urgencia.Critica,
    zona,
    contacto: "+584221234567",
    creadoEn,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.necesidad.estado, EstadoNecesidad.Abierta);
    assert.equal(result.value.necesidad.caducaEn.toISOString(), "2026-06-27T10:00:00.000Z");
    assert.deepEqual(result.value.matches.map((item) => item.id), ["cercano", "lejano"]);
    assert.equal(await necesidades.buscarPorTokenGestion("token-necesidad"), result.value.necesidad);
  }
});

test("lista necesidades abiertas priorizando CRITICA", async () => {
  const now = new Date("2026-06-25T10:00:00.000Z");
  const repo = new InMemoryNecesidadRepository([
    crearNecesidad({ id: "media", urgencia: Urgencia.Media, creadoEn: new Date("2026-06-25T09:00:00.000Z") }),
    crearNecesidad({ id: "critica", urgencia: Urgencia.Critica, creadoEn: new Date("2026-06-25T09:30:00.000Z") }),
  ]);

  const abiertas = await repo.listarAbiertasVigentes(now);

  assert.deepEqual(abiertas.map((item) => item.id), ["critica", "media"]);
});

function crearVoluntario(params: { readonly id: string; readonly lat: number }): Voluntario {
  const telefono = TelefonoVE.crear("+584121234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: params.lat, lng: -66.93 });
  assert.equal(telefono.ok, true);
  assert.equal(zona.ok, true);
  if (!telefono.ok || !zona.ok) throw new Error("Fixture invalido");

  const voluntario = Voluntario.crear({
    id: params.id,
    nombre: params.id,
    telefono: telefono.value,
    habilidades: [Habilidad.Medico],
    estado: EstadoVoluntario.Disponible,
    zona: zona.value,
    radioKm: 15,
    tokenGestion: `token-${params.id}`,
  });
  assert.equal(voluntario.ok, true);
  if (!voluntario.ok) throw new Error("Fixture invalido");

  return voluntario.value;
}

function crearNecesidad(params: {
  readonly id: string;
  readonly urgencia: Urgencia;
  readonly creadoEn: Date;
}): Necesidad {
  const contacto = TelefonoVE.crear("+584221234567");
  assert.equal(contacto.ok, true);
  if (!contacto.ok) throw new Error("Fixture invalido");

  const necesidad = Necesidad.crear({
    id: params.id,
    titulo: "Apoyo",
    descripcion: "Se requiere apoyo",
    habilidad: Habilidad.Medico,
    urgencia: params.urgencia,
    zona: crearZona(),
    contacto: contacto.value,
    tokenGestion: `token-${params.id}`,
    creadoEn: params.creadoEn,
    caducaEn: new Date("2026-06-27T10:00:00.000Z"),
  });
  assert.equal(necesidad.ok, true);
  if (!necesidad.ok) throw new Error("Fixture invalido");

  return necesidad.value;
}

function crearZona(): Zona {
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.499, lng: -66.93 });
  assert.equal(zona.ok, true);
  if (!zona.ok) throw new Error("Fixture invalido");

  return zona.value;
}
