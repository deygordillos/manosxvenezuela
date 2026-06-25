# 003 · Publicar necesidad — spec.md

> **Qué hace** y **criterios de aceptación**. Dispara el emparejamiento de 001 y devuelve coincidencias.

---

## Objetivo
Permitir publicar una necesidad concreta (qué habilidad, dónde, urgencia, contacto) y ver de inmediato voluntarios compatibles.

## Criterios de aceptación

**CA-1 · Publicación válida**
- **Dado** `/necesidad/nueva`, **cuando** ingreso título, descripción breve, habilidad requerida, estado/municipio, urgencia (`CRITICA|ALTA|MEDIA`) y contacto `+58…`, **y** paso anti-bot, **entonces** se crea con estado `ABIERTA` y caducidad por defecto 48 h.

**CA-2 · Ver coincidencias al publicar**
- **Entonces** veo una lista de voluntarios compatibles (habilidad + `DISPONIBLE` + dentro de radio), **ordenados por distancia**, cada uno con botón "Contactar por WhatsApp".

**CA-3 · Sin coincidencias**
- **Cuando** no hay voluntarios compatibles, **entonces** veo un estado vacío accionable que invita a compartir la necesidad.

**CA-4 · Anti-bot y rate limit**
- Turnstile + honeypot + time-trap. Máx. 5 publicaciones/10 min por IP; máx. 3 necesidades activas por teléfono → si excede, 429/400.

**CA-5 · Cerrar necesidad**
- **Dado** mi enlace de gestión, **cuando** marco `RESUELTA` o `CANCELADA`, **entonces** deja de listarse. Las caducadas pasan a `EXPIRADA` automáticamente.

## Datos (de `tech-stack.md` §3)
Tabla `necesidad`. El `contacto_e164` **no** se muestra en listados públicos (solo al contactar, feature 004).

## Reglas
- Las `CRITICA` se priorizan en cualquier listado.
- Caducidad 48 h por defecto.
