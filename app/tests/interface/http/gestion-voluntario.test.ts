import test from "node:test";
import assert from "node:assert/strict";
import { EmparejarVoluntarios } from "../../../src/application/use-cases/EmparejarVoluntarios";
import { Necesidad } from "../../../src/domain/entities/Necesidad";
import { EstadoVoluntario, Voluntario } from "../../../src/domain/entities/Voluntario";
import { Habilidad } from "../../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../../src/domain/value-objects/TelefonoVE";
import { Urgencia } from "../../../src/domain/value-objects/Urgencia";
import { Zona } from "../../../src/domain/value-objects/Zona";
import { getGestionVoluntario } from "../../../src/interface/http/gestion-voluntario";
import { patchVoluntarioEstado } from "../../../src/interface/http/voluntario";
import { InMemoryVoluntarioRepository } from "../../InMemoryVoluntarioRepository";

const tokenGestion = "12345678901234567890123456789012";

test("CA-1 token valido muestra nombre habilidades y estado", async () => {
  const response = await getGestionVoluntario(
    { query: { token: tokenGestion } },
    { voluntarios: new InMemoryVoluntarioRepository([crearVoluntario({ estado: EstadoVoluntario.Disponible })]) },
  );

  const html = String(response.body);
  assert.equal(response.status, 200);
  assert.equal(html.includes("Ana Perez"), true);
  assert.equal(html.includes("medico"), true);
  assert.equal(html.includes(EstadoVoluntario.Disponible), true);
});

test("CA-2 cambiar a DISPONIBLE permite aparecer en emparejamientos", async () => {
  const repo = new InMemoryVoluntarioRepository([crearVoluntario({ estado: EstadoVoluntario.Ocupado })]);

  const cambio = await patchVoluntarioEstado(
    { ip: "127.0.0.1", now: Date.parse("2026-06-25T12:00:00.000Z"), body: { tokenGestion, estado: EstadoVoluntario.Disponible } },
    { repo },
  );
  const matches = await new EmparejarVoluntarios(repo).ejecutar(crearNecesidad());

  assert.equal(cambio.status, 200);
  assert.equal(matches.ok, true);
  if (matches.ok) {
    assert.deepEqual(matches.value.map((voluntario) => voluntario.id), ["vol-1"]);
  }
});

test("CA-3 cambiar a OCUPADO lo excluye de emparejamientos", async () => {
  const repo = new InMemoryVoluntarioRepository([crearVoluntario({ estado: EstadoVoluntario.Disponible })]);

  const cambio = await patchVoluntarioEstado(
    { ip: "127.0.0.1", now: Date.parse("2026-06-25T12:00:00.000Z"), body: { tokenGestion, estado: EstadoVoluntario.Ocupado } },
    { repo },
  );
  const matches = await new EmparejarVoluntarios(repo).ejecutar(crearNecesidad());

  assert.equal(cambio.status, 200);
  assert.equal(matches.ok, true);
  if (matches.ok) {
    assert.deepEqual(matches.value, []);
  }
});

test("CA-4 cambiar a INACTIVO lo excluye de emparejamientos", async () => {
  const repo = new InMemoryVoluntarioRepository([crearVoluntario({ estado: EstadoVoluntario.Disponible })]);

  const cambio = await patchVoluntarioEstado(
    { ip: "127.0.0.1", now: Date.parse("2026-06-25T12:00:00.000Z"), body: { tokenGestion, estado: EstadoVoluntario.Inactivo } },
    { repo },
  );
  const matches = await new EmparejarVoluntarios(repo).ejecutar(crearNecesidad());

  assert.equal(cambio.status, 200);
  assert.equal(matches.ok, true);
  if (matches.ok) {
    assert.deepEqual(matches.value, []);
  }
});

test("CA-5 token invalido muestra aviso sin informacion", async () => {
  const response = await getGestionVoluntario(
    { query: { token: "00000000000000000000000000000000" } },
    { voluntarios: new InMemoryVoluntarioRepository([crearVoluntario({ estado: EstadoVoluntario.Disponible })]) },
  );

  const html = String(response.body);
  assert.equal(response.status, 404);
  assert.equal(html.includes("No encontramos este perfil"), true);
  assert.equal(html.includes("Ana Perez"), false);
  assert.equal(html.includes("medico"), false);
  assert.equal(html.includes("+584221234567"), false);
});

test("pagina de gestion no expone telefono ni id interno para mutacion", async () => {
  const response = await getGestionVoluntario(
    { query: { token: tokenGestion } },
    { voluntarios: new InMemoryVoluntarioRepository([crearVoluntario({ estado: EstadoVoluntario.Disponible })]) },
  );

  const html = String(response.body);
  assert.equal(html.includes("+584221234567"), false);
  assert.equal(html.includes("vol-1"), false);
  assert.equal(html.includes("tokenGestion"), true);
});

function crearVoluntario(params: { readonly estado: EstadoVoluntario }): Voluntario {
  const telefono = TelefonoVE.crear("+584221234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.499, lng: -66.93 });
  assert.equal(telefono.ok, true);
  assert.equal(zona.ok, true);
  if (!telefono.ok || !zona.ok) throw new Error("Fixture invalido");

  const voluntario = Voluntario.crear({
    id: "vol-1",
    nombre: "Ana Perez",
    telefono: telefono.value,
    habilidades: [Habilidad.Medico],
    estado: params.estado,
    zona: zona.value,
    radioKm: 15,
    tokenGestion,
    creadoEn: new Date("2026-06-25T10:00:00.000Z"),
  });
  assert.equal(voluntario.ok, true);
  if (!voluntario.ok) throw new Error("Fixture invalido");

  return voluntario.value;
}

function crearNecesidad(): Necesidad {
  const contacto = TelefonoVE.crear("+584221234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.526, lng: -66.93 });
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
    tokenGestion: "token-nec-1",
    creadoEn: new Date("2026-06-25T10:00:00.000Z"),
    caducaEn: new Date("2026-06-27T10:00:00.000Z"),
  });
  assert.equal(necesidad.ok, true);
  if (!necesidad.ok) throw new Error("Fixture invalido");

  return necesidad.value;
}
