# 009 · Gestión de voluntario por token — plan.md

> Página server-rendered ligera para disponibilidad del voluntario.

Estado: implementada en `feat/gestion-voluntario-token`.

## Archivos
```
src/interface/http/gestion-voluntario.ts
src/interface/web/GestionVoluntario.tsx
src/application/use-cases/CambiarDisponibilidad.ts
tests/interface/http/gestion-voluntario.test.ts
```

## Decisiones
- `GET /voluntario/gestion?token=...` renderiza estado actual.
- Acciones usan token, no ID.
- El caso de uso existente `CambiarDisponibilidad` sigue siendo la fuente de verdad.

## Pruebas
- Token válido renderiza estado.
- Token inválido no expone datos.
- Cambios de estado afectan emparejamiento.
