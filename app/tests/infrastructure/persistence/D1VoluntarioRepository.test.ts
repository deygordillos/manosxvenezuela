import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { D1VoluntarioRepository } from "../../../src/infrastructure/persistence/D1VoluntarioRepository";
import { EstadoVoluntario, Voluntario } from "../../../src/domain/entities/Voluntario";
import { Habilidad } from "../../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../../src/domain/value-objects/TelefonoVE";
import { Zona } from "../../../src/domain/value-objects/Zona";
import { FakeD1Database } from "./FakeD1Database.js";

type CrearParams = {
  readonly id?: string;
  readonly tokenGestion?: string;
  readonly estado?: EstadoVoluntario;
  readonly habilidades?: readonly Habilidad[];
};

function crearVoluntario(overrides: CrearParams = {}): Voluntario {
  const telefono = TelefonoVE.crear("+584121234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.4806, lng: -66.9036 });
  if (!telefono.ok || !zona.ok) throw new Error("fixture invalida");
  const voluntario = Voluntario.crear({
    id: overrides.id ?? "vol-test-1",
    nombre: "Voluntaria test",
    telefono: telefono.value,
    habilidades: overrides.habilidades ?? [Habilidad.Medico, Habilidad.VoluntarioGeneral],
    estado: overrides.estado ?? EstadoVoluntario.Disponible,
    zona: zona.value,
    radioKm: 15,
    tokenGestion: overrides.tokenGestion ?? "token-test-1",
  });
  if (!voluntario.ok) throw new Error("fixture invalida");
  return voluntario.value;
}

describe("D1VoluntarioRepository", () => {
  let db: FakeD1Database;
  let repo: D1VoluntarioRepository;

  beforeEach(() => {
    FakeD1Database.reset();
    db = new FakeD1Database();
    repo = new D1VoluntarioRepository(db);
  });

  it("guarda y recupera por token de gestion", async () => {
    const voluntario = crearVoluntario();
    await repo.guardar(voluntario);

    const resultado = await repo.buscarPorTokenGestion("token-test-1");
    assert.notEqual(resultado, null);
    assert.equal(resultado!.id, "vol-test-1");
    assert.equal(resultado!.nombre, "Voluntaria test");
    assert.equal(resultado!.estado, EstadoVoluntario.Disponible);
  });

  it("retorna null cuando token no existe", async () => {
    const resultado = await repo.buscarPorTokenGestion("token-inexistente");
    assert.equal(resultado, null);
  });

  it("guarda y recupera habilidades", async () => {
    const voluntario = crearVoluntario();
    await repo.guardar(voluntario);

    const resultado = await repo.buscarPorTokenGestion("token-test-1");
    assert.notEqual(resultado, null);
    assert.equal(resultado!.habilidades.has(Habilidad.Medico), true);
    assert.equal(resultado!.habilidades.has(Habilidad.VoluntarioGeneral), true);
  });

  it("cambia estado correctamente", async () => {
    const voluntario = crearVoluntario();
    await repo.guardar(voluntario);

    await repo.cambiarEstado("vol-test-1", EstadoVoluntario.Ocupado);
    const resultado = await repo.buscarPorTokenGestion("token-test-1");
    assert.notEqual(resultado, null);
    assert.equal(resultado!.estado, EstadoVoluntario.Ocupado);
  });

  it("busca compatibles por estado y habilidad", async () => {
    const medico = crearVoluntario({ id: "vol-medico", tokenGestion: "token-medico" });
    const paramedico = crearVoluntario({
      id: "vol-paramedico",
      tokenGestion: "token-paramedico",
      habilidades: [Habilidad.Paramedico],
    });
    await repo.guardar(medico);
    await repo.guardar(paramedico);

    const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.4806, lng: -66.9036 });
    if (!zona.ok) throw new Error("fixture invalida");

    const compatibles = await repo.buscarCompatibles({
      habilidad: Habilidad.Medico,
      estado: EstadoVoluntario.Disponible,
      centro: zona.value,
    });

    assert.equal(compatibles.length, 1);
    const encontrado = compatibles[0]!;
    assert.equal(encontrado.id, "vol-medico");
  });

  it("buscarPorTokenGestion con SQL parametrizado evita inyeccion", async () => {
    const voluntario = crearVoluntario();
    await repo.guardar(voluntario);

    const resultado = await repo.buscarPorTokenGestion("' OR '1'='1");
    assert.equal(resultado, null);
  });
});
