import test from "node:test";
import assert from "node:assert/strict";
import { GenerarContactoWhatsapp } from "../../src/application/use-cases/GenerarContactoWhatsapp";
import { EstadoNecesidad, Necesidad } from "../../src/domain/entities/Necesidad";
import { Habilidad } from "../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../src/domain/value-objects/TelefonoVE";
import { Urgencia } from "../../src/domain/value-objects/Urgencia";
import { Zona } from "../../src/domain/value-objects/Zona";
import { WhatsappLinkNotifier } from "../../src/infrastructure/notifications/WhatsappLinkNotifier";
import { InMemoryNecesidadRepository } from "../InMemoryNecesidadRepository";

test("genera enlace wa.me URL-encoded para necesidad activa", async () => {
  const repo = new InMemoryNecesidadRepository([crearNecesidad(EstadoNecesidad.Abierta)]);

  const result = await new GenerarContactoWhatsapp(repo, new WhatsappLinkNotifier()).ejecutar("nec-1");

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(
      result.value.url,
      "https://wa.me/584221234567?text=Hola%2C%20soy%20voluntario%20de%20Manos.%20Vi%20tu%20necesidad%20%22Atencion%20medica%22%20en%20Distrito%20Capital%2FCaracas.%20Como%20puedo%20ayudar%3F",
    );
  }
});

test("asigna la necesidad al generar el primer contacto", async () => {
  const repo = new InMemoryNecesidadRepository([crearNecesidad(EstadoNecesidad.Abierta)]);

  const result = await new GenerarContactoWhatsapp(repo, new WhatsappLinkNotifier()).ejecutar("nec-1");
  const necesidad = await repo.buscarPorId("nec-1");

  assert.equal(result.ok, true);
  assert.equal(necesidad?.estado, EstadoNecesidad.Asignada);
});

test("bloquea contacto duplicado para necesidad asignada", async () => {
  const repo = new InMemoryNecesidadRepository([crearNecesidad(EstadoNecesidad.Abierta)]);
  const contacto = new GenerarContactoWhatsapp(repo, new WhatsappLinkNotifier());

  const primerIntento = await contacto.ejecutar("nec-1");
  const segundoIntento = await contacto.ejecutar("nec-1");

  assert.equal(primerIntento.ok, true);
  assert.equal(segundoIntento.ok, false);
  if (!segundoIntento.ok) {
    assert.equal(segundoIntento.error.message, "Esta necesidad ya esta siendo atendida");
  }
});

test("no genera enlace para necesidades cerradas", async () => {
  for (const estado of [EstadoNecesidad.Resuelta, EstadoNecesidad.Cancelada, EstadoNecesidad.Expirada]) {
    const repo = new InMemoryNecesidadRepository([crearNecesidad(estado)]);

    const result = await new GenerarContactoWhatsapp(repo, new WhatsappLinkNotifier()).ejecutar("nec-1");

    assert.equal(result.ok, false);
  }
});

test("no genera enlace para necesidad asignada", async () => {
  const repo = new InMemoryNecesidadRepository([crearNecesidad(EstadoNecesidad.Asignada)]);

  const result = await new GenerarContactoWhatsapp(repo, new WhatsappLinkNotifier()).ejecutar("nec-1");

  assert.equal(result.ok, false);
});

function crearNecesidad(estado: EstadoNecesidad): Necesidad {
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
    urgencia: Urgencia.Critica,
    estado,
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
