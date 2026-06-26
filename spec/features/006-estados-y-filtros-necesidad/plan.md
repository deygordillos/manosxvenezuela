# 006 · Estados y filtros de necesidad — plan.md

> Extender listado existente con filtro por estado.

## Archivos
```
src/application/use-cases/ListarNecesidades.ts
src/interface/http/listado.ts
src/interface/web/ListadoNecesidades.tsx
src/application/ports/NecesidadRepository.ts
src/infrastructure/persistence/D1NecesidadRepository.ts
tests/use-cases/ListarNecesidades.test.ts
tests/interface/http/listado-contacto.test.ts
```

## Decisiones
- `estado` es opcional en el caso de uso, con default `ABIERTA`.
- El repositorio debe poder listar vigentes por estado o listar históricas filtradas.
- `EXPIRADA` se deriva de `estado=EXPIRADA`; las vencidas abiertas se siguen expirando por job/filtro.
- La UI agrega un select de estado junto a zona/habilidad.

## Pruebas
- Default `ABIERTA`.
- Estados cerrados visibles solo si se filtran.
- Contacto ausente en respuesta JSON.
- Filtros combinados.
