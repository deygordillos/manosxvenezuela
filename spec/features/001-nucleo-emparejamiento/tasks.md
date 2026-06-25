# 001 · Núcleo de emparejamiento — tasks.md

> Checklist accionable. No marcar "hecho" sin tests verdes.

## Dominio
- [x] `Result<T,E>` en `shared/`.
- [x] `DomainError` y subtipos (`TelefonoInvalido`, `HabilidadInvalida`).
- [x] `TelefonoVE.crear()` con regex `^\+58(412|414|415|416|422|424|426|2\d{2})\d{7}$`.
- [x] `Habilidad` (enum de 10 categorías) + `parse()`.
- [x] `Urgencia` con `pesoUrgencia` (CRITICA>ALTA>MEDIA).
- [x] `Geohash.encode(lat,lng)` + `distanciaKm()` (haversine).
- [x] `Zona` (estado_geo, lat, lng, geohash).
- [x] Entidades `Voluntario`, `Necesidad`, `Match` con factories que devuelven `Result`.

## Aplicación
- [x] Port `VoluntarioRepository`.
- [x] Caso de uso `EmparejarVoluntarios` (filtros + orden).
- [x] `InMemoryVoluntarioRepository` en `tests/`.

## Pruebas (mapean a CA del spec)
- [x] CA-1 match básico.
- [x] CA-2 excluir por habilidad.
- [x] CA-3 excluir por distancia.
- [x] CA-4 excluir por estado.
- [x] CA-5 orden por distancia.
- [x] CA-6 teléfono inválido → DomainError.

## Definition of Done
- [x] Tests verdes (`npm test`).
- [x] Sin `any`, `strict: true`.
- [x] Cero dependencias externas de runtime añadidas.
- [x] El dominio no importa nada de `infrastructure` ni de frameworks.
