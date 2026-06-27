import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { D1NecesidadRepository } from "../../../src/infrastructure/persistence/D1NecesidadRepository";
import { EstadoNecesidad, Necesidad } from "../../../src/domain/entities/Necesidad";
import { Habilidad } from "../../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../../src/domain/value-objects/TelefonoVE";
import { Urgencia } from "../../../src/domain/value-objects/Urgencia";
import { Zona } from "../../../src/domain/value-objects/Zona";
import { FakeD1Database } from "./FakeD1Database.js";

function ahora(): Date {
  return new Date("2025-06-01T12:00:00Z");
}

type CrearParams = {
  readonly id?: string;
  readonly tokenGestion?: string;
  readonly urgencia?: Urgencia;
  readonly creadoEn?: Date;
  readonly caducaEn?: Date;
  readonly titulo?: string;
};

function crearNecesidad(overrides: CrearParams = {}): Necesidad {
  const contacto = TelefonoVE.crear("+584221234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.4806, lng: -66.9036 });
  if (!contacto.ok || !zona.ok) throw new Error("fixture invalida");
  const necesidad = Necesidad.crear({
    id: overrides.id ?? "nec-test-1",
    titulo: overrides.titulo ?? "Ayuda medica urgente",
    descripcion: "Se necesita medico en el refugio.",
    habilidad: Habilidad.Medico,
    urgencia: overrides.urgencia ?? Urgencia.Critica,
    zona: zona.value,
    contacto: contacto.value,
    tokenGestion: overrides.tokenGestion ?? "token-nec-1",
    creadoEn: overrides.creadoEn ?? new Date("2025-06-01T10:00:00Z"),
    caducaEn: overrides.caducaEn ?? new Date("2025-06-03T10:00:00Z"),
  });
  if (!necesidad.ok) throw new Error("fixture invalida");
  return necesidad.value;
}

describe("D1NecesidadRepository", () => {
  let db: FakeD1Database;
  let repo: D1NecesidadRepository;

  beforeEach(() => {
    FakeD1Database.reset();
    db = new FakeD1Database();
    repo = new D1NecesidadRepository(db);
  });

  it("guarda y recupera por id", async () => {
    const necesidad = crearNecesidad();
    await repo.guardar(necesidad);

    const resultado = await repo.buscarPorId("nec-test-1");
    assert.notEqual(resultado, null);
    assert.equal(resultado!.id, "nec-test-1");
    assert.equal(resultado!.titulo, "Ayuda medica urgente");
  });

  it("retorna null cuando id no existe", async () => {
    const resultado = await repo.buscarPorId("nec-inexistente");
    assert.equal(resultado, null);
  });

  it("guarda y recupera por token de gestion", async () => {
    const necesidad = crearNecesidad();
    await repo.guardar(necesidad);

    const resultado = await repo.buscarPorTokenGestion("token-nec-1");
    assert.notEqual(resultado, null);
    assert.equal(resultado!.id, "nec-test-1");
  });

  it("cuenta activas por contacto", async () => {
    await repo.guardar(crearNecesidad({ id: "nec-1", tokenGestion: "tg-1" }));
    await repo.guardar(
      crearNecesidad({ id: "nec-2", tokenGestion: "tg-2", titulo: "Otra necesidad" }),
    );

    const contacto = TelefonoVE.crear("+584221234567");
    if (!contacto.ok) throw new Error("fixture invalida");
    const count = await repo.contarActivasPorContacto(contacto.value, ahora());
    assert.equal(count, 2);
  });

  it("cambia estado correctamente", async () => {
    await repo.guardar(crearNecesidad());

    await repo.cambiarEstado("nec-test-1", EstadoNecesidad.Asignada);
    const resultado = await repo.buscarPorId("nec-test-1");
    assert.notEqual(resultado, null);
    assert.equal(resultado!.estado, EstadoNecesidad.Asignada);
  });

  it("asignarSiAbierta solo funciona si esta ABIERTA y vigente", async () => {
    await repo.guardar(crearNecesidad());

    const asignada = await repo.asignarSiAbierta("nec-test-1", ahora());
    assert.equal(asignada, true);

    const resultado = await repo.buscarPorId("nec-test-1");
    assert.notEqual(resultado, null);
    assert.equal(resultado!.estado, EstadoNecesidad.Asignada);

    const yaNo = await repo.asignarSiAbierta("nec-test-1", ahora());
    assert.equal(yaNo, false);
  });

  it("expira necesidades vencidas", async () => {
    const ahoraDt = new Date("2025-06-05T12:00:00Z");
    await repo.guardar(
      crearNecesidad({
        id: "nec-vigente",
        tokenGestion: "tg-vigente",
        creadoEn: new Date("2025-06-01T10:00:00Z"),
        caducaEn: new Date("2025-06-10T12:00:00Z"),
      }),
    );
    await repo.guardar(
      crearNecesidad({
        id: "nec-vencida",
        tokenGestion: "tg-vencida",
        creadoEn: new Date("2025-05-20T10:00:00Z"),
        caducaEn: new Date("2025-05-30T12:00:00Z"),
      }),
    );

    const expiradas = await repo.expirarVencidas(ahoraDt);
    assert.equal(expiradas, 1);

    const vigente = await repo.buscarPorId("nec-vigente");
    assert.notEqual(vigente, null);
    assert.equal(vigente!.estado, EstadoNecesidad.Abierta);

    const vencida = await repo.buscarPorId("nec-vencida");
    assert.notEqual(vencida, null);
    assert.equal(vencida!.estado, EstadoNecesidad.Expirada);
  });

  it("listarAbiertasVigentes solo retorna ABIERTA no vencidas", async () => {
    await repo.guardar(
      crearNecesidad({
        id: "nec-1",
        tokenGestion: "tg-1",
        creadoEn: new Date("2025-06-01T10:00:00Z"),
        caducaEn: new Date("2025-06-10T12:00:00Z"),
      }),
    );
    await repo.guardar(
      crearNecesidad({
        id: "nec-2",
        tokenGestion: "tg-2",
        titulo: "Vencida",
        creadoEn: new Date("2025-05-20T10:00:00Z"),
        caducaEn: new Date("2025-05-30T12:00:00Z"),
      }),
    );

    const listado = await repo.listarAbiertasVigentes(ahora());
    assert.equal(listado.length, 1);
    const item = listado[0]!;
    assert.equal(item.id, "nec-1");
  });

  it("listarPorEstado ordena por urgencia (CRITICA primero) y creado_en DESC", async () => {
    await repo.guardar(
      crearNecesidad({
        id: "nec-media",
        tokenGestion: "tg-media",
        urgencia: Urgencia.Media,
        creadoEn: new Date("2025-06-01T11:00:00Z"),
        caducaEn: new Date("2025-06-10T12:00:00Z"),
      }),
    );
    await repo.guardar(
      crearNecesidad({
        id: "nec-critica",
        tokenGestion: "tg-critica",
        urgencia: Urgencia.Critica,
        creadoEn: new Date("2025-06-01T09:00:00Z"),
        caducaEn: new Date("2025-06-10T12:00:00Z"),
      }),
    );
    await repo.guardar(
      crearNecesidad({
        id: "nec-alta",
        tokenGestion: "tg-alta",
        urgencia: Urgencia.Alta,
        creadoEn: new Date("2025-06-01T10:00:00Z"),
        caducaEn: new Date("2025-06-10T12:00:00Z"),
      }),
    );

    const listado = await repo.listarPorEstado(EstadoNecesidad.Abierta, ahora());
    assert.equal(listado.length, 3);
    assert.equal(listado.length, 3);
    const primero = listado[0]!;
    const segundo = listado[1]!;
    const tercero = listado[2]!;
    assert.equal(primero.id, "nec-critica");
    assert.equal(segundo.id, "nec-alta");
    assert.equal(tercero.id, "nec-media");
  });

  it("SQL parametrizado evita inyeccion en busqueda por token", async () => {
    await repo.guardar(crearNecesidad());

    const resultado = await repo.buscarPorTokenGestion("' OR 1=1 --");
    assert.equal(resultado, null);
  });
});
