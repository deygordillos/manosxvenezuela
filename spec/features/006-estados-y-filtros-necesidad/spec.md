# 006 · Estados y filtros de necesidad — spec.md

> Filtrar el listado por estado, zona y habilidad sin exponer contacto.

---

## Objetivo
Permitir que el listado público muestre necesidades por estado para operación y seguimiento, manteniendo `ABIERTA` como vista por defecto.

## Alcance
- Filtro por estado en UI y API.
- `GET /api/necesidades?estado=&zona=&habilidad=`.
- Orden por urgencia dentro del estado filtrado.

## Criterios de aceptación

**CA-1 · Default abiertas**
- **Dado** `/`, **entonces** veo solo necesidades `ABIERTA` por defecto.

**CA-2 · Filtrar por estado**
- **Cuando** filtro por `ASIGNADA`, `RESUELTA`, `CANCELADA` o `EXPIRADA`, **entonces** la lista muestra solo ese estado.

**CA-3 · Filtros combinados**
- **Cuando** combino estado, zona y habilidad, **entonces** la lista cumple todos los filtros.

**CA-4 · Privacidad**
- **Entonces** ningún listado retorna ni renderiza `contacto_e164`.

**CA-5 · Priorización**
- **Entonces** las `CRITICA` siguen arriba dentro del estado filtrado.

## Reglas
- El contacto solo se revela mediante la acción de contactar (feature 004/007).
- Necesidades cerradas no generan contacto aunque sean visibles por filtro.
