# 008 · Gestión de necesidad por token — spec.md

> Permite a quien publicó cerrar una necesidad sin login.

---

## Objetivo
Dar a la persona solicitante una página de gestión por `token_gestion` para marcar su necesidad como `RESUELTA` o `CANCELADA`.

## Alcance
- Página `/necesidad/gestion?token=...`.
- Acciones `RESUELTA` y `CANCELADA`.
- Reuso de `PATCH /api/necesidad/estado`.

## Criterios de aceptación

**CA-1 · Token válido**
- **Dado** un token válido, **entonces** veo título, zona y estado actual de la necesidad.

**CA-2 · Resolver**
- **Cuando** marco `RESUELTA`, **entonces** deja de aparecer en abiertas.

**CA-3 · Cancelar**
- **Cuando** marco `CANCELADA`, **entonces** deja de aparecer en abiertas.

**CA-4 · Token inválido**
- **Cuando** el token no existe, **entonces** veo aviso claro y no se expone información.

**CA-5 · Privacidad**
- **Entonces** la página no expone datos innecesarios ni IDs internos para mutación.

## Reglas
- No hay login; el token opaco es la autorización.
- No aceptar cambios sin token válido.
