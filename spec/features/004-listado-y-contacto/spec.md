# 004 · Listado público y contacto — spec.md

> **Qué hace** y **criterios de aceptación**. Cierra el ciclo: ver necesidades abiertas y contactar por WhatsApp.

---

## Objetivo
Mostrar las necesidades abiertas (priorizando críticas) y permitir que un voluntario contacte al solicitante por WhatsApp con un mensaje pre-rellenado, a costo cero.

## Criterios de aceptación

**CA-1 · Listado público**
- **Dado** `/` (inicio), **entonces** veo las necesidades `ABIERTA` ordenadas con las `CRITICA` primero, luego por recencia; cada tarjeta muestra habilidad, zona (municipio), urgencia (chip de color) y antigüedad. **No** se muestra el contacto del solicitante.

**CA-2 · Filtro por zona y habilidad**
- **Cuando** filtro por estado/municipio o por habilidad, **entonces** la lista se reduce en consecuencia.

**CA-3 · Banda de estado global (signature)**
- **Entonces** la banda de pulso refleja el estado: verde (sin críticas), ámbar (críticas activas), rojo (crítica sin voluntarios disponibles cerca). Respeta `prefers-reduced-motion`.

**CA-4 · Contactar por WhatsApp**
- **Cuando** pulso "Contactar por WhatsApp" en una necesidad, **entonces** se abre `wa.me/<numero>?text=<mensaje>` con el número del solicitante y un mensaje pre-rellenado que incluye título y zona de la necesidad. El número solo se resuelve en este momento (no antes).

**CA-5 · Necesidad ya cerrada**
- **Cuando** intento contactar una necesidad que ya está `RESUELTA/EXPIRADA`, **entonces** veo un aviso de que ya no está activa y no se genera el enlace.

## Reglas
- El contacto se revela **solo** en la acción de contactar (privacidad, `tech-stack.md` §5).
- Mensaje de WhatsApp URL-encoded.
