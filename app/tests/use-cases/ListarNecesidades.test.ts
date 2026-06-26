import test from "node:test";
import assert from "node:assert/strict";
import { ListarNecesidades } from "../../src/application/use-cases/ListarNecesidades";
import { EstadoNecesidad, Necesidad } from "../../src/domain/entities/Necesidad";
import { EstadoVoluntario, Voluntario } from "../../src/domain/entities/Voluntario";
import { Habilidad } from "../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../src/domain/value-objects/TelefonoVE";
import { Urgencia } from "../../src/domain/value-objects/Urgencia";
import { Zona } from "../../src/domain/value-objects/Zona";
import { InMemoryNecesidadRepository } from "../InMemoryNecesidadRepository";
import { InMemoryVoluntarioRepository } from "../InMemoryVoluntarioRepository";

test("lista ABIERTA con CRITICA primero y luego por recencia", async () => {
  const now = new Date("2026-06-25T12:00:00.000Z");
  const repo = new InMemoryNecesidadRepository([
    crearNecesidad({ id: "media-reciente", urgencia: Urgencia.Media, creadoEn: new Date("2026-06-25T11:50:00.000Z") }),
    crearNecesidad({ id: "critica-vieja", urgencia: Urgencia.Critica, creadoEn: new Date("2026-06-25T10:00:00.000Z") }),
    crearNecesidad({ id: "alta", urgencia: Urgencia.Alta, creadoEn: new Date("2026-06-25T11:55:00.000Z") }),
  ]);

  const result = await new ListarNecesidades(repo).ejecutar(now);

  assert.deepEqual(result.necesidades.map((item) => item.id), ["critica-vieja", "alta", "media-reciente"]);
  assert.equal(result.estadoPulso, "ambar");
});

test("filtra por zona y habilidad", async () => {
  const now = new Date("2026-06-25T12:00:00.000Z");
  const repo = new InMemoryNecesidadRepository([
    crearNecesidad({ id: "caracas-medico", habilidad: Habilidad.Medico, zona: "Distrito Capital/Caracas" }),
    crearNecesidad({ id: "valencia-medico", habilidad: Habilidad.Medico, zona: "Carabobo/Valencia" }),
    crearNecesidad({ id: "caracas-transporte", habilidad: Habilidad.Transporte, zona: "Distrito Capital/Caracas" }),
  ]);

  const result = await new ListarNecesidades(repo).ejecutar(now, {
    zona: "Distrito Capital/Caracas",
    habilidad: Habilidad.Medico,
  });

  assert.deepEqual(result.necesidades.map((item) => item.id), ["caracas-medico"]);
});

test("pulso verde sin criticas y rojo si una critica no tiene voluntarios cerca", async () => {
  const now = new Date("2026-06-25T12:00:00.000Z");
  const sinCriticas = await new ListarNecesidades(
    new InMemoryNecesidadRepository([crearNecesidad({ id: "media", urgencia: Urgencia.Media })]),
  ).ejecutar(now);
  const conCriticaSinVoluntarios = await new ListarNecesidades(
    new InMemoryNecesidadRepository([crearNecesidad({ id: "critica", urgencia: Urgencia.Critica })]),
    new InMemoryVoluntarioRepository([crearVoluntarioLejano()]),
  ).ejecutar(now);

  assert.equal(sinCriticas.estadoPulso, "verde");
  assert.equal(conCriticaSinVoluntarios.estadoPulso, "rojo");
});

function crearNecesidad(params: {
  readonly id: string;
  readonly urgencia?: Urgencia;
  readonly habilidad?: Habilidad;
  readonly zona?: string;
  readonly creadoEn?: Date;
}): Necesidad {
  const contacto = TelefonoVE.crear("+584221234567");
  const zona = crearZona(params.zona ?? "Distrito Capital/Caracas");
  assert.equal(contacto.ok, true);
  if (!contacto.ok) throw new Error("Fixture invalido");

  const necesidad = Necesidad.crear({
    id: params.id,
    titulo: "Apoyo",
    descripcion: "Se requiere apoyo",
    habilidad: params.habilidad ?? Habilidad.Medico,
    urgencia: params.urgencia ?? Urgencia.Alta,
    estado: EstadoNecesidad.Abierta,
    zona,
    contacto: contacto.value,
    tokenGestion: `token-${params.id}`,
    creadoEn: params.creadoEn ?? new Date("2026-06-25T10:00:00.000Z"),
    caducaEn: new Date("2026-06-27T10:00:00.000Z"),
  });
  assert.equal(necesidad.ok, true);
  if (!necesidad.ok) throw new Error("Fixture invalido");

  return necesidad.value;
}

function crearVoluntarioLejano(): Voluntario {
  const telefono = TelefonoVE.crear("+584121234567");
  const zona = Zona.crear({ estadoGeo: "Carabobo/Valencia", lat: 10.162, lng: -68.008 });
  assert.equal(telefono.ok, true);
  assert.equal(zona.ok, true);
  if (!telefono.ok || !zona.ok) throw new Error("Fixture invalido");

  const voluntario = Voluntario.crear({
    id: "vol-lejano",
    nombre: "Voluntario lejano",
    telefono: telefono.value,
    habilidades: [Habilidad.Medico],
    estado: EstadoVoluntario.Disponible,
    zona: zona.value,
    radioKm: 5,
    tokenGestion: "token-vol-lejano",
  });
  assert.equal(voluntario.ok, true);
  if (!voluntario.ok) throw new Error("Fixture invalido");

  return voluntario.value;
}

function crearZona(estadoGeo: string): Zona {
  const coords = estadoGeo === "Carabobo/Valencia" ? { lat: 10.162, lng: -68.008 } : { lat: 10.499, lng: -66.93 };
  const zona = Zona.crear({ estadoGeo, ...coords });
  assert.equal(zona.ok, true);
  if (!zona.ok) throw new Error("Fixture invalido");

  return zona.value;
}
