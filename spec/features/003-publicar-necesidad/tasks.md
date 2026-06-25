# 003 · Publicar necesidad — tasks.md

## Aplicación
- [ ] Port `NecesidadRepository`.
- [ ] Caso de uso `PublicarNecesidad` (crea + empareja) + test.
- [ ] Caso de uso `CerrarNecesidad`.

## Infraestructura
- [ ] `D1NecesidadRepository` (o Supabase).
- [ ] Cron de caducidad/purga (o filtro `caduca_en > now` en listados).

## Interfaz
- [ ] `POST /api/necesidad` con flujo de seguridad.
- [ ] `PATCH /api/necesidad/estado` (token de gestión).
- [ ] Pantalla `PublicarNecesidad.tsx` con resultados de match.

## Seguridad
- [ ] Zod + Turnstile + honeypot + time-trap.
- [ ] Rate limit IP (5/10 min) + teléfono (≤3 activas).
- [ ] Contacto del solicitante nunca en listado público.

## Definition of Done
- [ ] CA-1..CA-5 verificados.
- [ ] `CRITICA` se prioriza en listados.
- [ ] Mobile 380px, AA, foco visible.
- [ ] Tests verdes.
