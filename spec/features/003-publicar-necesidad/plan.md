# 003 · Publicar necesidad — plan.md

> **Cómo se implementa.** Reusa el caso de uso `EmparejarVoluntarios` de 001.

## Archivos
```
src/application/use-cases/PublicarNecesidad.ts   # crea + invoca EmparejarVoluntarios
src/application/use-cases/CerrarNecesidad.ts
src/application/ports/NecesidadRepository.ts
src/infrastructure/persistence/D1NecesidadRepository.ts
src/interface/http/necesidad.ts                  # POST /api/necesidad, PATCH /api/necesidad/estado
src/interface/web/PublicarNecesidad.tsx          # formulario + resultados de match
tests/use-cases/PublicarNecesidad.test.ts
```

## Flujo `POST /api/necesidad`
1. Rate limit por IP (5/10 min) y por teléfono (≤3 activas).
2. Zod + honeypot + time-trap + Turnstile.
3. `PublicarNecesidad.ejecutar()`: crea `Necesidad` (estado `ABIERTA`, `caduca_en = now+48h`), persiste, luego llama `EmparejarVoluntarios(necesidad)`.
4. Responde 201 con la necesidad creada + lista de voluntarios compatibles (sin exponer datos sensibles de más).

## Caducidad
- Job programado (Cron Trigger de Cloudflare Workers o función cron) marca `EXPIRADA` lo vencido y, junto con `RESUELTA/CANCELADA`, programa purga a 7 días.
- Alternativa sin cron: filtrar `caduca_en > now` en cada consulta de listado.

## Decisiones
- `NecesidadRepository` separado del de voluntarios (responsabilidad única).
- El emparejamiento se invoca **después** de persistir, para que la necesidad exista aunque el match falle.
- Contacto del solicitante guardado pero **no** retornado en el listado público.

## Interfaz
- Formulario corto (urgencia con chips de color de triage: rojo/ámbar/gris).
- Resultados de match como tarjetas con distancia y botón de contacto (el contacto real se resuelve en feature 004).
- Estado vacío accionable (CA-3).
