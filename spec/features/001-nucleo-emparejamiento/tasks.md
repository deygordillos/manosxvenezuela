# 001 · Núcleo de emparejamiento — tasks.md

> Checklist accionable. No marcar "hecho" sin tests verdes.

## Dominio
- [ ] `Result<T,E>` en `shared/`.
- [ ] `DomainError` y subtipos (`TelefonoInvalido`, `HabilidadInvalida`).
- [ ] `TelefonoVE.crear()` con regex `^\+58(412|414|416|424|426|2\d{2})\d{7}$`.
- [ ] `Habilidad` (enum de 10 categorías) + `parse()`.
- [ ] `Urgencia` con `pesoUrgencia` (CRITICA>ALTA>MEDIA).
- [ ] `Geohash.encode(lat,lng)` + `distanciaKm()` (haversine).
- [ ] `Zona` (estado_geo, lat, lng, geohash).
- [ ] Entidades `Voluntario`, `Necesidad`, `Match` con factories que devuelven `Result`.

## Aplicación
- [ ] Port `VoluntarioRepository`.
- [ ] Caso de uso `EmparejarVoluntarios` (filtros + orden).
- [ ] `InMemoryVoluntarioRepository` en `tests/`.

## Pruebas (mapean a CA del spec)
- [ ] CA-1 match básico.
- [ ] CA-2 excluir por habilidad.
- [ ] CA-3 excluir por distancia.
- [ ] CA-4 excluir por estado.
- [ ] CA-5 orden por distancia.
- [ ] CA-6 teléfono inválido → DomainError.

## Definition of Done
- [ ] Tests verdes (`npm test`).
- [ ] Sin `any`, `strict: true`.
- [ ] Cero dependencias externas añadidas.
- [ ] El dominio no importa nada de `infrastructure` ni de frameworks.
