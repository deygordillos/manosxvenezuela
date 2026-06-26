import test from "node:test";
import assert from "node:assert/strict";
import { EstadoNecesidad, Necesidad } from "../../../src/domain/entities/Necesidad";
import { Habilidad } from "../../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../../src/domain/value-objects/TelefonoVE";
import { Urgencia } from "../../../src/domain/value-objects/Urgencia";
import { Zona } from "../../../src/domain/value-objects/Zona";
import { getGestionNecesidad } from "../../../src/interface/http/gestion-necesidad";
import { getNecesidades } from "../../../src/interface/http/listado";
import { patchNecesidadEstado } from "../../../src/interface/http/necesidad";
import { InMemoryNecesidadRepository } from "../../InMemoryNecesidadRepository";
import { InMemoryVoluntarioRepository } from "../../InMemoryVoluntarioRepository";

const tokenGestion = "12345678901234567890123456789012";

test("CA-1 token valido muestra titulo zona y estado", async () => {
  const response = await getGestionNecesidad(
    { query: { token: tokenGestion } },
    { necesidades: new InMemoryNecesidadRepository([crearNecesidad({ id: "nec-1" })]) },
  );

  const html = String(response.body);
  assert.equal(response.status, 200);
  assert.equal(html.includes("Atencion medica"), true);
  assert.equal(html.includes("Distrito Capital/Caracas"), true);
  assert.equal(html.includes(EstadoNecesidad.Abierta), true);
});

test("CA-2 marcar RESUELTA la saca del listado abierto", async () => {
  const repo = new InMemoryNecesidadRepository([crearNecesidad({ id: "nec-1" })]);

  const cierre = await patchNecesidadEstado(
    { ip: "127.0.0.1", now: Date.parse("2026-06-25T12:00:00.000Z"), body: { tokenGestion, estado: EstadoNecesidad.Resuelta } },
    { necesidades: repo },
  );
  const listado = await getNecesidades(
    { now: Date.parse("2026-06-25T12:00:00.000Z"), query: {} },
    { necesidades: repo, voluntarios: new InMemoryVoluntarioRepository() },
  );

  assert.equal(cierre.status, 200);
  assert.deepEqual((listado.body as ListadoBody).necesidades.map((item) => item.id), []);
});

test("CA-3 marcar CANCELADA la saca del listado abierto", async () => {
  const repo = new InMemoryNecesidadRepository([crearNecesidad({ id: "nec-1" })]);

  const cierre = await patchNecesidadEstado(
    { ip: "127.0.0.1", now: Date.parse("2026-06-25T12:00:00.000Z"), body: { tokenGestion, estado: EstadoNecesidad.Cancelada } },
    { necesidades: repo },
  );
  const listado = await getNecesidades(
    { now: Date.parse("2026-06-25T12:00:00.000Z"), query: {} },
    { necesidades: repo, voluntarios: new InMemoryVoluntarioRepository() },
  );

  assert.equal(cierre.status, 200);
  assert.deepEqual((listado.body as ListadoBody).necesidades.map((item) => item.id), []);
});

test("CA-4 token invalido muestra aviso sin informacion", async () => {
  const response = await getGestionNecesidad(
    { query: { token: "00000000000000000000000000000000" } },
    { necesidades: new InMemoryNecesidadRepository([crearNecesidad({ id: "nec-1" })]) },
  );

  const html = String(response.body);
  assert.equal(response.status, 404);
  assert.equal(html.includes("No encontramos esta necesidad"), true);
  assert.equal(html.includes("Atencion medica"), false);
  assert.equal(html.includes("Distrito Capital/Caracas"), false);
});

test("CA-5 pagina de gestion no expone contacto ni id interno", async () => {
  const response = await getGestionNecesidad(
    { query: { token: tokenGestion } },
    { necesidades: new InMemoryNecesidadRepository([crearNecesidad({ id: "nec-1" })]) },
  );

  const html = String(response.body);
  assert.equal(html.includes("+584221234567"), false);
  assert.equal(html.includes("contacto"), false);
  assert.equal(html.includes("nec-1"), false);
  assert.equal(html.includes("tokenGestion"), true);
});

type ListadoBody = {
  readonly necesidades: readonly { readonly id: string }[];
};

function crearNecesidad(params: { readonly id: string; readonly estado?: EstadoNecesidad }): Necesidad {
  const contacto = TelefonoVE.crear("+584221234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.499, lng: -66.93 });
  assert.equal(contacto.ok, true);
  assert.equal(zona.ok, true);
  if (!contacto.ok || !zona.ok) throw new Error("Fixture invalido");

  const necesidad = Necesidad.crear({
    id: params.id,
    titulo: "Atencion medica",
    descripcion: "Se requiere apoyo medico",
    habilidad: Habilidad.Medico,
    urgencia: Urgencia.Alta,
    estado: params.estado ?? EstadoNecesidad.Abierta,
    zona: zona.value,
    contacto: contacto.value,
    tokenGestion,
    creadoEn: new Date("2026-06-25T10:00:00.000Z"),
    caducaEn: new Date("2026-06-27T10:00:00.000Z"),
  });
  assert.equal(necesidad.ok, true);
  if (!necesidad.ok) throw new Error("Fixture invalido");

  return necesidad.value;
}
