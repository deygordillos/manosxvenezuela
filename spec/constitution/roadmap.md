# roadmap.md — Orden de las features

> Constitución de **Manos**. Define en qué orden se construyen las features y qué entra después del MVP.

---

## Orden de construcción (MVP, "en horas")

| # | Estado | Feature | Por qué este orden | Carpeta |
|---|---|---|---|---|
| 001 | Hecha | **Núcleo de emparejamiento** | Es el corazón del sistema; define dominio y reglas que el resto usa. Se construye con repos en memoria y tests, sin UI ni infra. | `features/001-nucleo-emparejamiento/` |
| 002 | Pendiente | **Registro de voluntario** | Sin voluntarios no hay a quién emparejar. Primer flujo de escritura → estrena el baseline de seguridad. | `features/002-registro-voluntario/` |
| 003 | Pendiente | **Publicar necesidad** | Dispara el emparejamiento (001) y devuelve coincidencias. | `features/003-publicar-necesidad/` |
| 004 | Pendiente | **Listado público y contacto** | Cierra el ciclo: ver necesidades y contactar por WhatsApp (`wa.me`). | `features/004-listado-y-contacto/` |

> Seguridad/anti-bot (§5 de `tech-stack.md`) y diseño UI (§4) son **convenciones transversales**, no features sueltas: cada feature las aplica en su `plan.md` y `tasks.md`.

## Secuencia recomendada de despliegue
- **Fase 0 (0–30 min):** dominio, Cloudflare, D1/Supabase con esquema, claves Turnstile.
- **Fase 1 (30–120 min):** scaffold + feature **001** (dominio + match con tests).
- **Fase 2 (2–4 h):** adapters de **002/003** (persistencia, Notificador wa.me, seguridad).
- **Fase 3 (3–5 h, en paralelo):** interfaz de **002/003/004** con el sistema de diseño.
- **Fase 4 (1–2 h):** endurecimiento, prueba de acceso desde VE, e2e, datos semilla, go-live.

## Post-MVP (priorizado)
1. **Verificación por OTP de WhatsApp** para habilidades críticas (rescate, médico).
2. **Panel de coordinadores** (verificación y reasignación de necesidades).
3. **Mapa interactivo** (Leaflet + OpenStreetMap, clustering por zona).
4. **Notificaciones automáticas** (WhatsApp Cloud API, capa gratuita — aquí puede entrar parte del presupuesto de 100 USD).
5. **PWA instalable** con caché offline de necesidades cercanas.
6. **Métricas públicas** (necesidades resueltas, tiempo medio a primer contacto).

## Cómo añadir una feature nueva
1. Crear `features/NNN-nombre/` con `spec.md`, `plan.md`, `tasks.md`.
2. `spec.md` = qué hace + criterios de aceptación (Given/When/Then).
3. `plan.md` = cómo se implementa (capas, archivos, decisiones).
4. `tasks.md` = checklist accionable, incluyendo seguridad y diseño del baseline.
5. Añadir la fila correspondiente a este `roadmap.md`.
