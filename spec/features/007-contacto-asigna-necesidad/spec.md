# 007 · Contacto asigna necesidad — spec.md

> Al contactar, la necesidad deja de aparecer como abierta y se bloquean contactos duplicados.

---

## Objetivo
Evitar que múltiples voluntarios contacten la misma necesidad desde el listado público una vez que alguien ya inició el contacto.

## Alcance
- Cambiar `ABIERTA → ASIGNADA` al generar el enlace `wa.me`.
- Bloquear nuevos contactos si ya está `ASIGNADA`, `RESUELTA`, `CANCELADA` o `EXPIRADA`.
- Permitir ver `ASIGNADA` mediante filtro de estado (feature 006).

## Criterios de aceptación

**CA-1 · Contacto asigna**
- **Dado** una necesidad `ABIERTA`, **cuando** ejecuto `POST /api/contacto/:id`, **entonces** se genera el enlace `wa.me` y la necesidad pasa a `ASIGNADA`.

**CA-2 · Sale del listado default**
- **Entonces** la necesidad asignada no aparece en `/` por defecto.

**CA-3 · Visible por filtro**
- **Cuando** filtro `estado=ASIGNADA`, **entonces** la necesidad aparece sin contacto expuesto.

**CA-4 · Contacto duplicado bloqueado**
- **Cuando** intento contactar una necesidad `ASIGNADA`, **entonces** recibo aviso de que ya está siendo atendida y no se genera enlace.

**CA-5 · Cerradas bloqueadas**
- **Cuando** intento contactar `RESUELTA/CANCELADA/EXPIRADA`, **entonces** no se genera enlace.

## Reglas
- El número se revela solo en el primer contacto exitoso.
- No se requiere login ni panel.
