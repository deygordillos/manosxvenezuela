# 012 · Seguridad de producción — plan.md

> Endurecer antes de deploy.

## Archivos
```
src/infrastructure/security/TurnstileAntiBot.ts
src/infrastructure/security/EdgeRateLimiter.ts
src/interface/http/securityHeaders.ts
src/infrastructure/logging/logger.ts
tests/interface/http/security.test.ts
README.md
```

## Decisiones
- Headers se aplican en un helper común para todas las respuestas.
- Rate limit productivo queda detrás del port `RateLimiter`.
- Logger rechaza PII por convención y tests de snapshots simples.

## Pruebas
- Escrituras sin Turnstile fallan.
- Headers presentes.
- Rate limit corta antes del caso de uso.
- No PII en logs de errores esperados.
