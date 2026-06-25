# 002 · Registro de voluntario — tasks.md

## Aplicación
- [x] Caso de uso `RegistrarVoluntario` (+ test).
- [x] Caso de uso `CambiarDisponibilidad`.

## Infraestructura
- [x] `D1VoluntarioRepository` (o Supabase) implementando el port de 001.
- [x] `municipios.ts` (estado_geo → lat/lng).
- [x] `TurnstileAntiBot` (verificación server-side).
- [x] `EdgeRateLimiter` (KV/DO o Upstash) por IP.

## Interfaz
- [x] Endpoint `POST /api/voluntario` con el flujo de 6 pasos del plan.
- [x] Endpoint `PATCH /api/voluntario/estado` (vía token de gestión).
- [x] Pantalla `RegistroVoluntario.tsx` con tokens de diseño.

## Seguridad (baseline obligatorio)
- [x] Zod en el borde.
- [x] Turnstile + honeypot + time-trap.
- [x] Rate limit por IP (20/h).
- [x] `token_gestion` 128 bits; sin PII en logs.

## Definition of Done
- [x] CA-1..CA-5 verificados.
- [x] Mobile 380px, foco visible, contraste AA.
- [x] Tests verdes.
