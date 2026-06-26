# 009 · Gestión de voluntario por token — spec.md

> Permite al voluntario cambiar disponibilidad sin login.

---

## Objetivo
Dar a cada voluntario una página de gestión por `token_gestion` para cambiar su estado operativo y controlar si aparece en emparejamientos.

## Alcance
- Página `/voluntario/gestion?token=...`.
- Acciones `DISPONIBLE`, `OCUPADO`, `INACTIVO`.
- Reuso de `PATCH /api/voluntario/estado`.

## Criterios de aceptación

**CA-1 · Token válido**
- **Dado** un token válido, **entonces** veo nombre, habilidades y estado actual del voluntario.

**CA-2 · Cambiar a disponible**
- **Cuando** marco `DISPONIBLE`, **entonces** puede aparecer en emparejamientos compatibles.

**CA-3 · Cambiar a ocupado**
- **Cuando** marco `OCUPADO`, **entonces** deja de aparecer en emparejamientos.

**CA-4 · Cambiar a inactivo**
- **Cuando** marco `INACTIVO`, **entonces** deja de aparecer en emparejamientos.

**CA-5 · Token inválido**
- **Cuando** el token no existe, **entonces** veo aviso claro y no se expone información.

## Reglas
- El token opaco autoriza la gestión.
- No exponer IDs internos para mutaciones.
