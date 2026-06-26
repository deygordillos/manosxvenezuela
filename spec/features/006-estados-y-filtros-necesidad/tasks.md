# 006 · Estados y filtros de necesidad — tasks.md

## Aplicación
- [ ] Extender `ListarNecesidades` con filtro `estado` y default `ABIERTA`.
- [ ] Mantener orden `CRITICA` primero dentro del filtro.

## Infraestructura
- [ ] Extender `NecesidadRepository` para listar por estado.
- [ ] Actualizar `D1NecesidadRepository`.
- [ ] Actualizar repos en memoria de tests/dev.

## Interfaz
- [ ] Agregar `estado` a `GET /api/necesidades`.
- [ ] Agregar select de estado en home.
- [ ] Mantener contacto fuera de la respuesta.

## Definition of Done
- [ ] CA-1..CA-5 verificados.
- [ ] Tests verdes.
