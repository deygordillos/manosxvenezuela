# 002 · Registro de voluntario — plan.md

> **Cómo se implementa.** Reusa el dominio de 001. Añade adapter de persistencia, seguridad e interfaz.

## Archivos
```
src/application/use-cases/RegistrarVoluntario.ts
src/application/use-cases/CambiarDisponibilidad.ts
src/infrastructure/persistence/D1VoluntarioRepository.ts   (o SupabaseVoluntarioRepository)
src/infrastructure/security/TurnstileAntiBot.ts
src/infrastructure/security/EdgeRateLimiter.ts
src/interface/http/voluntario.ts            # POST /api/voluntario, PATCH /api/voluntario/estado
src/interface/web/RegistroVoluntario.tsx    # pantalla
tests/use-cases/RegistrarVoluntario.test.ts
```

## Flujo del endpoint `POST /api/voluntario`
1. Rate limit por IP (EdgeRateLimiter) → 429 si excede.
2. Validar payload con **Zod** (nombre, telefono, habilidades[], estado_geo, radio, honeypot, ts, turnstileToken).
3. Honeypot lleno o `now - ts < 2s` → 400.
4. Verificar Turnstile (server-side) → 400 si falla.
5. `RegistrarVoluntario.ejecutar()`: crea `Voluntario` (dominio valida teléfono), genera `token_gestion` (128 bits), persiste vía repo.
6. Responder 201 con enlace de gestión (no se loguea PII).

## Decisiones
- El adapter implementa el port `VoluntarioRepository` de 001 → el caso de uso no sabe si es D1 o Supabase.
- `buscarCompatibles` prefiltra por `geohash` (prefijo) + `estado` usando `idx_vol_match`, y afina con haversine en memoria.
- Centroides de municipio: tabla estática `src/shared/municipios.ts` (estado_geo → lat/lng).

## Interfaz (design system de `tech-stack.md` §4)
- Formulario de una columna, mobile 380px, botones ≥44px.
- Habilidades como chips multi-selección.
- Estado de éxito muestra el enlace de gestión con botón "Copiar" y aviso de guardarlo.
- Errores con copy claro (CA-2).
