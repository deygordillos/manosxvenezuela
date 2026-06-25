import test from "node:test";
import assert from "node:assert/strict";
import { EmparejarVoluntarios } from "../../src/application/use-cases/EmparejarVoluntarios";
import { Necesidad } from "../../src/domain/entities/Necesidad";
import { EstadoVoluntario, Voluntario } from "../../src/domain/entities/Voluntario";
import { Habilidad } from "../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../src/domain/value-objects/TelefonoVE";
import { Urgencia } from "../../src/domain/value-objects/Urgencia";
import { Zona } from "../../src/domain/value-objects/Zona";
import { InMemoryVoluntarioRepository } from "../InMemoryVoluntarioRepository";

test("CA-1 match basico por habilidad y cercania", async () => {
  const necesidad = crearNecesidad({ habilidad: Habilidad.Medico });
  const voluntario = crearVoluntario({
    id: "vol-1",
    habilidad: Habilidad.Medico,
    lat: 10.544,
    radioKm: 15,
  });

  const result = await new EmparejarVoluntarios(
    new InMemoryVoluntarioRepository([voluntario]),
  ).ejecutar(necesidad);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(
      result.value.map((item) => item.id),
      ["vol-1"],
    );
  }
});

test("CA-2 excluye por habilidad no coincidente", async () => {
  const necesidad = crearNecesidad({ habilidad: Habilidad.Medico });
  const voluntario = crearVoluntario({
    id: "vol-1",
    habilidad: Habilidad.Transporte,
    lat: 10.544,
    radioKm: 15,
  });

  const result = await new EmparejarVoluntarios(
    new InMemoryVoluntarioRepository([voluntario]),
  ).ejecutar(necesidad);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.length, 0);
  }
});

test("CA-3 excluye por distancia fuera de radio", async () => {
  const necesidad = crearNecesidad({ habilidad: Habilidad.Medico });
  const voluntario = crearVoluntario({
    id: "vol-1",
    habilidad: Habilidad.Medico,
    lat: 10.724,
    radioKm: 10,
  });

  const result = await new EmparejarVoluntarios(
    new InMemoryVoluntarioRepository([voluntario]),
  ).ejecutar(necesidad);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.length, 0);
  }
});

test("CA-4 excluye por estado no disponible", async () => {
  const necesidad = crearNecesidad({ habilidad: Habilidad.Medico });
  const voluntario = crearVoluntario({
    id: "vol-1",
    habilidad: Habilidad.Medico,
    estado: EstadoVoluntario.Ocupado,
    lat: 10.544,
    radioKm: 15,
  });

  const result = await new EmparejarVoluntarios(
    new InMemoryVoluntarioRepository([voluntario]),
  ).ejecutar(necesidad);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.length, 0);
  }
});

test("CA-5 ordena por distancia ascendente", async () => {
  const necesidad = crearNecesidad({ habilidad: Habilidad.Medico });
  const cercano = crearVoluntario({
    id: "vol-cercano",
    habilidad: Habilidad.Medico,
    lat: 10.526,
    radioKm: 15,
  });
  const lejano = crearVoluntario({
    id: "vol-lejano",
    habilidad: Habilidad.Medico,
    lat: 10.571,
    radioKm: 15,
  });

  const result = await new EmparejarVoluntarios(
    new InMemoryVoluntarioRepository([lejano, cercano]),
  ).ejecutar(necesidad);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(
      result.value.map((item) => item.id),
      ["vol-cercano", "vol-lejano"],
    );
  }
});

function crearNecesidad(params: { readonly habilidad: Habilidad }): Necesidad {
  const zona = Zona.crear({ estadoGeo: "Distrito Capital", lat: 10.499, lng: -66.93 });
  const contacto = TelefonoVE.crear("+584121234567");
  assert.equal(zona.ok, true);
  assert.equal(contacto.ok, true);

  if (!zona.ok || !contacto.ok) {
    throw new Error("Fixture invalido");
  }

  const necesidad = Necesidad.crear({
    id: "nec-1",
    titulo: "Atencion medica",
    descripcion: "Se requiere apoyo medico",
    habilidad: params.habilidad,
    urgencia: Urgencia.Alta,
    zona: zona.value,
    contacto: contacto.value,
    tokenGestion: "token-nec-1",
    creadoEn: new Date("2026-06-25T10:00:00.000Z"),
    caducaEn: new Date("2026-06-27T10:00:00.000Z"),
  });

  assert.equal(necesidad.ok, true);
  if (!necesidad.ok) {
    throw new Error("Fixture invalido");
  }

  return necesidad.value;
}

function crearVoluntario(params: {
  readonly id: string;
  readonly habilidad: Habilidad;
  readonly lat: number;
  readonly radioKm: number;
  readonly estado?: EstadoVoluntario;
}): Voluntario {
  const zona = Zona.crear({ estadoGeo: "Distrito Capital", lat: params.lat, lng: -66.93 });
  const telefono = TelefonoVE.crear("+584141234567");
  assert.equal(zona.ok, true);
  assert.equal(telefono.ok, true);

  if (!zona.ok || !telefono.ok) {
    throw new Error("Fixture invalido");
  }

  const voluntario = Voluntario.crear({
    id: params.id,
    nombre: "Voluntario",
    telefono: telefono.value,
    habilidades: [params.habilidad],
    estado: params.estado,
    zona: zona.value,
    radioKm: params.radioKm,
    tokenGestion: `token-${params.id}`,
    creadoEn: new Date("2026-06-25T09:00:00.000Z"),
  });

  assert.equal(voluntario.ok, true);
  if (!voluntario.ok) {
    throw new Error("Fixture invalido");
  }

  return voluntario.value;
}
