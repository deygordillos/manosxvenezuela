# 001 · Núcleo de emparejamiento — spec.md

> **Qué hace** y **criterios de aceptación**. El corazón del sistema: dado una necesidad, encontrar los voluntarios correctos y cercanos.

---

## Objetivo
Implementar el dominio (entidades, value-objects, reglas) y el caso de uso `EmparejarVoluntarios`, **sin UI ni base de datos real** (repos en memoria). Es la base que consumen las features 002–004.

## Alcance
- Entidades: `Voluntario`, `Necesidad`, `Match`.
- Value-objects: `TelefonoVE`, `Habilidad`, `Urgencia`, `Zona` (incluye `Geohash`, lat/lng).
- Caso de uso: `EmparejarVoluntarios(necesidad) → Voluntario[]` ordenado.
- Función de distancia: geohash + haversine sobre centroides de municipio.

## Reglas de negocio
- Filtros (AND): `habilidad ∈ voluntario.habilidades` · `voluntario.estado = DISPONIBLE` · `distancia ≤ voluntario.radio_km`.
- Orden: distancia ascendente; desempate por urgencia y luego `creado_en`.
- Una necesidad `CRITICA` se prioriza en cualquier listado.
- Un `TelefonoVE` inválido nunca crea entidad (regla de dominio, no de UI).

## Criterios de aceptación

**CA-1 · Match básico por habilidad y cercanía**
- **Dado** un voluntario `DISPONIBLE` con habilidad `medico`, radio 15 km, a 5 km de la necesidad,
  **y** una necesidad que requiere `medico`,
  **cuando** ejecuto `EmparejarVoluntarios`, **entonces** el voluntario aparece en el resultado.

**CA-2 · Excluir por habilidad no coincidente**
- **Dado** un voluntario solo con `transporte` **y** una necesidad de `medico`,
  **entonces** el voluntario **no** aparece.

**CA-3 · Excluir por distancia fuera de radio**
- **Dado** un voluntario con radio 10 km a 25 km de la necesidad,
  **entonces** **no** aparece.

**CA-4 · Excluir por estado no disponible**
- **Dado** un voluntario `OCUPADO` aunque coincida en habilidad y cercanía,
  **entonces** **no** aparece.

**CA-5 · Orden por distancia**
- **Dado** dos voluntarios compatibles a 3 km y 8 km,
  **entonces** el de 3 km aparece primero.

**CA-6 · Validación de dominio del teléfono**
- **Dado** un teléfono que no cumple `^\+58(412|414|416|424|426|2\d{2})\d{7}$`,
  **entonces** la creación del voluntario falla con `DomainError` (no se persiste).

## Fuera de alcance (otras features)
- Persistencia real (002/003 con adapters).
- Formularios y pantallas (002/003/004).
- Anti-bot y rate limit (se aplican en los endpoints, no en el dominio).
