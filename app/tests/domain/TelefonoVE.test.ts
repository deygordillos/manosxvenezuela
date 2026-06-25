import test from "node:test";
import assert from "node:assert/strict";
import { TelefonoVE } from "../../src/domain/value-objects/TelefonoVE";

test("CA-6 telefono invalido devuelve DomainError", () => {
  const result = TelefonoVE.crear("+581231234567");

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "TELEFONO_INVALIDO");
  }
});

test("telefono movil VE valido crea value object", () => {
  const result = TelefonoVE.crear("+584121234567");

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.value, "+584121234567");
  }
});

test("telefono movil VE 422 crea value object", () => {
  const result = TelefonoVE.crear("+584221234567");

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.value, "+584221234567");
  }
});

test("telefono movil VE 415 crea value object", () => {
  const result = TelefonoVE.crear("+584151234567");

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.value, "+584151234567");
  }
});
