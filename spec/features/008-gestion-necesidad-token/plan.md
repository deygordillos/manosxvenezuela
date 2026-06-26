# 008 · Gestión de necesidad por token — plan.md

> Página server-rendered ligera para cerrar necesidades.

Estado: implementada en `feat/gestion-necesidad-token`.

## Archivos
```
src/interface/http/gestion-necesidad.ts
src/interface/web/GestionNecesidad.tsx
src/application/use-cases/CerrarNecesidad.ts
tests/interface/http/gestion-necesidad.test.ts
```

## Decisiones
- `GET /necesidad/gestion?token=...` renderiza estado actual.
- Formulario POST/PATCH usa el token, no el ID público.
- El handler traduce acciones a `RESUELTA` o `CANCELADA`.

## Pruebas
- Render token válido.
- Render token inválido.
- Acción resuelta/cancelada.
