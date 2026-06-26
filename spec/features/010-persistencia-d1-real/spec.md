# 010 · Persistencia D1 real — spec.md

> Sustituir memoria/dev por Cloudflare D1 como almacenamiento real.

---

## Objetivo
Persistir voluntarios, necesidades y matches en Cloudflare D1 usando SQL portable y adapters ya definidos.

## Alcance
- Migraciones SQL.
- Wiring de repos D1 en runtime.
- Seeds mínimos de dev/staging.
- Mantener dominio/aplicación desacoplados.

## Criterios de aceptación

**CA-1 · Migración crea esquema**
- **Cuando** ejecuto migraciones, **entonces** existen tablas `voluntario`, `voluntario_habilidad`, `necesidad` y `match`.

**CA-2 · Registro persiste**
- **Cuando** registro un voluntario, **entonces** queda guardado y puede consultarse por token.

**CA-3 · Necesidad persiste**
- **Cuando** publico una necesidad, **entonces** queda guardada y aparece en listado.

**CA-4 · Contacto actualiza estado**
- **Cuando** contacto una necesidad, **entonces** su estado persistido cambia según feature 007.

**CA-5 · Sin acoplar dominio**
- **Entonces** `domain` y `application` no importan D1 ni APIs de Cloudflare.

## Reglas
- SQL parametrizado siempre.
- No guardar PII innecesaria.
