# 011 · Configuración por entorno — plan.md

> Crear capa de configuración mínima.

## Archivos
```
src/infrastructure/config/env.ts
src/infrastructure/config/container.ts
.env.example
README.md
```

## Decisiones
- `loadEnv(process.env)` valida y normaliza configuración.
- `container` arma repos, anti-bot, rate limit y base URL.
- Dev server consume el mismo env.

## Pruebas
- Dev defaults.
- Producción falla si faltan secretos.
- Variables documentadas.
