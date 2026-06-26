# 006 · Estados y filtros de necesidad — tasks.md

## Aplicación
- [x] Extender `ListarNecesidades` con filtro `estado` y default `ABIERTA`.
- [x] Mantener orden `CRITICA` primero dentro del filtro.

## Infraestructura
- [x] Extender `NecesidadRepository` para listar por estado.
- [x] Actualizar `D1NecesidadRepository`.
- [x] Actualizar repos en memoria de tests/dev.

## Interfaz
- [x] Agregar `estado` a `GET /api/necesidades`.
- [x] Agregar select de estado en home.
- [x] Mantener contacto fuera de la respuesta.

## Definition of Done
- [x] CA-1..CA-5 verificados.
- [x] Tests verdes.
