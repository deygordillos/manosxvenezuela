import test from "node:test";
import assert from "node:assert/strict";
import { CambiarDisponibilidad } from "../../src/application/use-cases/CambiarDisponibilidad";
import { EstadoVoluntario, Voluntario } from "../../src/domain/entities/Voluntario";
import { Habilidad } from "../../src/domain/value-objects/Habilidad";
import { TelefonoVE } from "../../src/domain/value-objects/TelefonoVE";
import { Zona } from "../../src/domain/value-objects/Zona";
import { InMemoryVoluntarioRepository } from "../InMemoryVoluntarioRepository";

test("cambia disponibilidad por token de gestion", async () => {
  const voluntario = crearVoluntario();
  const repo = new InMemoryVoluntarioRepository([voluntario]);

  const result = await new CambiarDisponibilidad(repo).ejecutar({
    tokenGestion: "token-gestion",
    estado: EstadoVoluntario.Ocupado,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.estado, EstadoVoluntario.Ocupado);
  }
});

function crearVoluntario(): Voluntario {
  const telefono = TelefonoVE.crear("+584121234567");
  const zona = Zona.crear({ estadoGeo: "Distrito Capital/Caracas", lat: 10.499, lng: -66.93 });
  assert.equal(telefono.ok, true);
  assert.equal(zona.ok, true);
  if (!telefono.ok || !zona.ok) throw new Error("Fixture invalido");

  const voluntario = Voluntario.crear({
    id: "vol-1",
    nombre: "Ana Perez",
    telefono: telefono.value,
    habilidades: [Habilidad.Medico],
    zona: zona.value,
    tokenGestion: "token-gestion",
  });
  assert.equal(voluntario.ok, true);
  if (!voluntario.ok) throw new Error("Fixture invalido");

  return voluntario.value;
}
