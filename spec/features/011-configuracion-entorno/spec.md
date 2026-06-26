# 011 · Configuración por entorno — spec.md

> Eliminar hardcoded operativo con variables de entorno y defaults seguros de dev.

---

## Objetivo
Centralizar configuración para que dev, staging y producción no dependan de valores embebidos en código.

## Alcance
- `BASE_URL`.
- `PORT`.
- `TURNSTILE_SECRET` y `TURNSTILE_SITE_KEY`.
- Límites de rate limit.
- Modo `dev/staging/prod`.
- Defaults locales seguros para desarrollo.

## Criterios de aceptación

**CA-1 · Config centralizada**
- **Entonces** los valores operativos salen de `env.ts` o equivalente.

**CA-2 · Dev funciona sin secretos reales**
- **Cuando** corro `npm run dev`, **entonces** usa defaults locales y Turnstile fake explícito.

**CA-3 · Prod exige secretos**
- **Cuando** `NODE_ENV=production` y faltan secretos requeridos, **entonces** el arranque falla rápido.

**CA-4 · Sin hardcoded operativo**
- **Entonces** no quedan URLs, tokens ni límites productivos dispersos.

**CA-5 · Documentado**
- **Entonces** README lista variables y comandos.

## Reglas
- No commitear secretos.
- Defaults solo para dev local.
