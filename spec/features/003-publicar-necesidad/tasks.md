# 003 · Publicar necesidad — tasks.md

## Aplicación
- [x] Port `NecesidadRepository`.
- [x] Caso de uso `PublicarNecesidad` (crea + empareja) + test.
- [x] Caso de uso `CerrarNecesidad`.

## Infraestructura
- [x] `D1NecesidadRepository` (o Supabase).
- [x] Cron de caducidad/purga (o filtro `caduca_en > now` en listados).

## Interfaz
- [x] `POST /api/necesidad` con flujo de seguridad.
- [x] `PATCH /api/necesidad/estado` (token de gestión).
- [x] Pantalla `PublicarNecesidad.tsx` con resultados de match.

## Seguridad
- [x] Zod + Turnstile + honeypot + time-trap.
- [x] Rate limit IP (5/10 min) + teléfono (≤3 activas).
- [x] Contacto del solicitante nunca en listado público.

## Definition of Done
- [x] CA-1..CA-5 verificados.
- [x] `CRITICA` se prioriza en listados.
- [x] Mobile 380px, AA, foco visible.
- [x] Tests verdes.
