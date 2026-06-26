import test from "node:test";
import assert from "node:assert/strict";
import { EstadoNecesidad, Necesidad } from "../../../src/domain/entities/Necesidad";
import { EstadoVoluntario, Voluntario } from "../../../src/domain/entities/Voluntario";
import { Habilidad } from "../../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../../src/domain/value-objects/TelefonoVE";
import { Urgencia } from "../../../src/domain/value-objects/Urgencia";
import { Zona } from "../../../src/domain/value-objects/Zona";
import { postContacto } from "../../../src/interface/http/contacto";
import { getNecesidades } from "../../../src/interface/http/listado";
import { InMemoryNecesidadRepository } from "../../InMemoryNecesidadRepository";
import { InMemoryVoluntarioRepository } from "../../InMemoryVoluntarioRepository";

test("CA-1 listado publico no expone contacto y ordena criticas primero", async () => {
  const response = await getNecesidades(
    { now: Date.parse("2026-06-25T12:00:00.000Z"), query: {} },
    {
      necesidades: new InMemoryNecesidadRepository([
        crearNecesidad({ id: "media", urgencia: Urgencia.Media, creadoEn: new Date("2026-06-25T11:50:00.000Z") }),
        crearNecesidad({ id: "critica", urgencia: Urgencia.Critica, creadoEn: new Date("2026-06-25T10:00:00.000Z") }),
      ]),
      voluntarios: new InMemoryVoluntarioRepository([crearVoluntario()]),
    },
  );

  assert.equal(response.status, 200);
  const bodyText = JSON.stringify(response.body);
  assert.equal(bodyText.includes("+584221234567"), false);
  assert.equal(bodyText.includes("contacto"), false);
  assert.deepEqual((response.body as ListadoBody).necesidades.map((item) => item.id), ["critica", "media"]);
});

test("CA-2 filtra por zona y habilidad", async () => {
  const response = await getNecesidades(
    { now: Date.parse("2026-06-25T12:00:00.000Z"), query: { zona: "Carabobo/Valencia", habilidad: Habilidad.Transporte } },
    {
      necesidades: new InMemoryNecesidadRepository([
        crearNecesidad({ id: "caracas-medico", habilidad: Habilidad.Medico, zona: "Distrito Capital/Caracas" }),
        crearNecesidad({ id: "valencia-transporte", habilidad: Habilidad.Transporte, zona: "Carabobo/Valencia" }),
      ]),
      voluntarios: new InMemoryVoluntarioRepository(),
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual((response.body as ListadoBody).necesidades.map((item) => item.id), ["valencia-transporte"]);
});

test("CA-3 banda roja cuando critica no tiene voluntarios cerca", async () => {
  const response = await getNecesidades(
    { now: Date.parse("2026-06-25T12:00:00.000Z"), query: {} },
    {
      necesidades: new InMemoryNecesidadRepository([crearNecesidad({ id: "critica", urgencia: Urgencia.Critica })]),
      voluntarios: new InMemoryVoluntarioRepository(),
    },
  );

  assert.equal((response.body as ListadoBody).estadoPulso, "rojo");
});

test("CA-4 contacto resuelve numero solo al pulsar", async () => {
  const response = await postContacto(
    { params: { necesidadId: "nec-1" } },
    { necesidades: new InMemoryNecesidadRepository([crearNecesidad({ id: "nec-1" })]) },
  );

  assert.equal(response.status, 200);
  assert.equal(
    (response.body as { readonly url: string }).url,
    "https://wa.me/584221234567?text=Hola%2C%20soy%20voluntario%20de%20Manos.%20Vi%20tu%20necesidad%20%22Atencion%20medica%22%20en%20Distrito%20Capital%2FCaracas.%20Como%20puedo%20ayudar%3F",
  );
});

test("CA-5 necesidad cerrada no genera enlace", async () => {
  const response = await postContacto(
    { params: { necesidadId: "nec-1" } },
    { necesidades: new InMemoryNecesidadRepository([crearNecesidad({ id: "nec-1", estado: EstadoNecesidad.Resuelta })]) },
  );

  assert.equal(response.status, 409);
});

type ListadoBody = {
  readonly estadoPulso: string;
  readonly necesidades: readonly { readonly id: string }[];
};

function crearNecesidad(params: {
  readonly id: string;
  readonly urgencia?: Urgencia;
  readonly habilidad?: Habilidad;
  readonly zona?: string;
  readonly estado?: EstadoNecesidad;
  readonly creadoEn?: Date;
}): Necesidad {
  const contacto = TelefonoVE.crear("+584221234567");
  const zona = crearZona(params.zona ?? "Distrito Capital/Caracas");
  assert.equal(contacto.ok, true);
  if (!contacto.ok) throw new Error("Fixture invalido");

  const necesidad = Necesidad.crear({
    id: params.id,
    titulo: "Atencion medica",
    descripcion: "Se requiere apoyo medico",
    habilidad: params.habilidad ?? Habilidad.Medico,
    urgencia: params.urgencia ?? Urgencia.Alta,
    estado: params.estado ?? EstadoNecesidad.Abierta,
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

function crearVoluntario(): Voluntario {
  const telefono = TelefonoVE.crear("+584121234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.526, lng: -66.93 });
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

function crearZona(estadoGeo: string): Zona {
  const coords = estadoGeo === "Carabobo/Valencia" ? { lat: 10.162, lng: -68.008 } : { lat: 10.499, lng: -66.93 };
  const zona = Zona.crear({ estadoGeo, ...coords });
  assert.equal(zona.ok, true);
  if (!zona.ok) throw new Error("Fixture invalido");

  return zona.value;
}
