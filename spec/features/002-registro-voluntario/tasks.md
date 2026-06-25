# 002 · Registro de voluntario — tasks.md

## Aplicación
- [ ] Caso de uso `RegistrarVoluntario` (+ test).
- [ ] Caso de uso `CambiarDisponibilidad`.

## Infraestructura
- [ ] `D1VoluntarioRepository` (o Supabase) implementando el port de 001.
- [ ] `municipios.ts` (estado_geo → lat/lng).
- [ ] `TurnstileAntiBot` (verificación server-side).
- [ ] `EdgeRateLimiter` (KV/DO o Upstash) por IP.

## Interfaz
- [ ] Endpoint `POST /api/voluntario` con el flujo de 6 pasos del plan.
- [ ] Endpoint `PATCH /api/voluntario/estado` (vía token de gestión).
- [ ] Pantalla `RegistroVoluntario.tsx` con tokens de diseño.

## Seguridad (baseline obligatorio)
- [ ] Zod en el borde.
- [ ] Turnstile + honeypot + time-trap.
- [ ] Rate limit por IP (20/h).
- [ ] `token_gestion` 128 bits; sin PII en logs.

## Definition of Done
- [ ] CA-1..CA-5 verificados.
- [ ] Mobile 380px, foco visible, contraste AA.
- [ ] Tests verdes.
