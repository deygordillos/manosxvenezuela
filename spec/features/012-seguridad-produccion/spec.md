# 012 · Seguridad de producción — spec.md

> Cerrar baseline OWASP antes de go-live.

---

## Objetivo
Aplicar seguridad productiva a endpoints y páginas públicas según `tech-stack.md` §5.

## Alcance
- Turnstile real en escrituras.
- Headers de seguridad.
- Rate limit productivo reemplazable por Cloudflare KV/DO/WAF.
- Logging sin PII.
- Audit básico.

## Criterios de aceptación

**CA-1 · Turnstile real**
- **Cuando** un endpoint de escritura no trae token válido, **entonces** falla.

**CA-2 · Headers de seguridad**
- **Entonces** respuestas HTML/API incluyen CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`.

**CA-3 · Rate limit productivo**
- **Cuando** se exceden límites, **entonces** responde 429 sin ejecutar el caso de uso.

**CA-4 · Logs sin PII**
- **Entonces** no se loguean teléfonos, contactos ni tokens.

**CA-5 · Audit listo para deploy**
- **Entonces** `npm audit --omit=dev` está documentado y ejecutable.

## Reglas
- Ningún endpoint de escritura sin Zod + Turnstile + rate limit.
- No introducir servicios pagos sin justificarlo.
