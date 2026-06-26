# 010 · Persistencia D1 real — plan.md

> Conectar adapters D1 y migraciones.

## Archivos
```
migrations/0001_initial.sql
src/infrastructure/config/env.ts
src/infrastructure/config/container.ts
src/infrastructure/persistence/D1VoluntarioRepository.ts
src/infrastructure/persistence/D1NecesidadRepository.ts
tests/infrastructure/persistence/*.test.ts
```

## Decisiones
- Usar el SQL de `tech-stack.md` §3 como base.
- El container decide repos in-memory vs D1 según entorno.
- Mantener dev server con memoria hasta que exista runtime Workers real; D1 se cablea en runtime productivo.

## Pruebas
- Tests de contrato de repositorio contra fake D1 o SQLite compatible.
- Smoke de migración.
