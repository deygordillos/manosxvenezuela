# 002 · Registro de voluntario — spec.md

> **Qué hace** y **criterios de aceptación**. Primer flujo de escritura: estrena el baseline de seguridad de `tech-stack.md` §5.

---

## Objetivo
Permitir que una persona se registre como voluntario indicando habilidades, zona, radio y disponibilidad, para recibir solicitudes pertinentes.

## Alcance
- Pantalla `/voluntario/registro`.
- Endpoint de escritura que persiste el voluntario (adapter real D1/Supabase).
- Cambio de disponibilidad desde el enlace de gestión.

## Criterios de aceptación

**CA-1 · Registro válido**
- **Dado** `/voluntario/registro`, **cuando** ingreso nombre, teléfono `+58…` válido, ≥1 habilidad, estado/municipio y radio, **y** paso Turnstile, **entonces** se crea el perfil con estado `DISPONIBLE` y veo confirmación + enlace de gestión.

**CA-2 · Teléfono inválido**
- **Cuando** el teléfono no cumple el formato VE, **entonces** veo el error *"Ese número no parece venezolano. Revisa el formato +58."* y no se persiste.

**CA-3 · Anti-bot**
- **Cuando** falla la verificación Turnstile o el honeypot está relleno o el envío ocurre en <2 s, **entonces** se rechaza con 400 y no se persiste.

**CA-4 · Rate limit**
- **Cuando** una IP supera 20 registros/hora, **entonces** recibe 429.

**CA-5 · Cambiar disponibilidad**
- **Dado** mi enlace de gestión, **cuando** cambio a `OCUPADO`, **entonces** dejo de aparecer en emparejamientos de inmediato.

## Datos (de `tech-stack.md` §3)
Tablas `voluntario` y `voluntario_habilidad`. Sin cédula ni dirección exacta (solo municipio).

## Seguridad aplicada (baseline)
Zod + Turnstile + honeypot + rate limit por IP. `token_gestion` opaco de 128 bits. Sin PII en logs.
