import test from "node:test";
import assert from "node:assert/strict";
import { renderPageShell } from "../../../src/interface/web/layout/PageShell";
import { renderListadoNecesidadesPage } from "../../../src/interface/web/ListadoNecesidades";
import { renderPublicarNecesidadPage } from "../../../src/interface/web/PublicarNecesidad";
import { renderRegistroVoluntarioPage } from "../../../src/interface/web/RegistroVoluntario";

test("PageShell renderiza header global y footer de autoria", () => {
  const html = renderPageShell({
    title: "Prueba",
    activePath: "/",
    styles: "",
    body: "<main>Contenido</main>",
  });

  assert.match(html, /ManosXVenezuela/);
  assert.match(html, /Coordinamos voluntarios y necesidades para responder más rápido\./);
  assert.match(html, /Inicio/);
  assert.match(html, /Registrar voluntario/);
  assert.match(html, /Publicar necesidad/);
  assert.match(html, /Desarrollado por/);
  assert.match(html, /Dey Gordillo/);
  assert.match(html, /https:\/\/github\.com\/deygordillos/);
});

test("paginas principales usan el shell comun", () => {
  const pages = [
    renderListadoNecesidadesPage({ necesidades: [], estadoPulso: "verde", now: new Date("2026-06-25T10:00:00.000Z") }),
    renderRegistroVoluntarioPage("local-dev", 1),
    renderPublicarNecesidadPage("local-dev", 1),
  ];

  for (const html of pages) {
    assert.match(html, /ManosXVenezuela/);
    assert.match(html, /Desarrollado por/);
    assert.match(html, /https:\/\/github\.com\/deygordillos/);
  }
});
