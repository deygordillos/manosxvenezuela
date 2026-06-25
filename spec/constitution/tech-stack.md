# tech-stack.md — Tecnologías y convenciones

> Constitución de **Manos**. Reglas que **toda** feature debe cumplir.
> Si una feature contradice este documento, se detiene y se actualiza la constitución primero.

---

## 1. Arquitectura — Clean Architecture + modular desacoplada

Regla de dependencias: **las flechas apuntan hacia adentro.** `domain` no conoce a nadie; `infrastructure`/`interface` conocen a `application`/`domain`; nada de adentro importa frameworks.

```
interface (entrega)  ─┐
  application (casos) ─┤  PORTS = interfaces
    domain (núcleo)   ─┘  entidades, value-objects, reglas puras
infrastructure implementa los PORTS (adapters)
```

### Estructura de carpetas (en `código/`)
```
src/
  domain/
    entities/            # Voluntario, Necesidad, Match
    value-objects/       # TelefonoVE, Habilidad, Urgencia, Zona, Geohash
    errors/              # DomainError y subtipos
  application/
    ports/               # VoluntarioRepository, NecesidadRepository, Notificador, RateLimiter, AntiBot
    use-cases/           # RegistrarVoluntario, PublicarNecesidad, EmparejarVoluntarios, CerrarNecesidad
    dtos/
  infrastructure/
    persistence/         # adapters de repos (D1/SQLite o Supabase)
    notifications/       # WhatsappLinkNotifier (wa.me), EmailNotifier (opcional)
    security/            # TurnstileAntiBot, EdgeRateLimiter
    config/              # env + DI container
  interface/
    http/                # route handlers / API
    web/                 # componentes React + design tokens
  shared/                # Result<T,E>, logger, utils puras
tests/
  domain/ · use-cases/ · e2e/
```

### Ports clave (desacople = cambiar de infra gratis)
```ts
export interface VoluntarioRepository {
  guardar(v: Voluntario): Promise<void>;
  buscarCompatibles(criterio: CriterioMatch): Promise<Voluntario[]>;
  cambiarEstado(id: VoluntarioId, estado: EstadoVoluntario): Promise<void>;
}
export interface Notificador {
  // Adapter por defecto NO envía nada: genera un enlace wa.me (costo 0).
  generarContacto(necesidad: Necesidad, voluntario: Voluntario): EnlaceContacto;
}
```
> Migrar de **Supabase → Cloudflare D1** debe tocar solo `infrastructure/persistence`. Esto protege la gratuidad: si una capa deja de ser gratis o alcanzable desde VE, se cambia el adapter en minutos.

---

## 2. Stack e infraestructura (tendiendo a 0 USD; tope 100 USD)

### Nota crítica — geo-bloqueo desde Venezuela
Algunos SaaS de EE. UU. aplican bloqueos por sanciones que pueden impedir el acceso *de usuarios venezolanos*. La red de **Cloudflare es ampliamente alcanzable desde Venezuela**. **Probar el acceso desde una IP venezolana antes de anunciar.**

### Opción A — Recomendada por alcance VE (todo gratis)
| Capa | Servicio | Plan | Costo |
|---|---|---|---|
| Frontend + API | Cloudflare Pages + Workers (Next.js `@cloudflare/next-on-pages`, o Astro/Remix) | Free | 0 |
| Base de datos | Cloudflare D1 (SQLite) | Free | 0 |
| Anti-bot | Cloudflare Turnstile | Free | 0 |
| Rate limit | Workers KV / Durable Objects o WAF rate-limiting | Free | 0 |
| DNS+CDN+TLS | Cloudflare | Free | 0 |
| Notificaciones | Enlaces `wa.me` | — | 0 |
| Dominio | `manosve.org` | — | ~12 USD/año |

### Opción B — La más rápida de construir (Next.js nativo)
| Capa | Servicio | Plan | Costo |
|---|---|---|---|
| Frontend + API | Next.js en Vercel | Free | 0 |
| BD + Auth ligera | Supabase (Postgres + RLS) *(pausa por inactividad)* | Free | 0 |
| Anti-bot | Cloudflare Turnstile | Free | 0 |
| Rate limit | Upstash Redis + `@upstash/ratelimit` | Free | 0 |
| CDN/WAF delante | Cloudflare (proxy ante Vercel) | Free | 0 |
| Notificaciones | `wa.me` | — | 0 |

> **Recomendación:** prioridad *alcance VE* → **Opción A**. Prioridad *salir en horas con tu stack* y alcanzabilidad confirmada → **Opción B**. Margen de los 100 USD reservado para WhatsApp Cloud API (notificaciones automáticas, roadmap) o Worker pagado si el tráfico explota.

### Geolocalización sin mapas (MVP)
Centroides de municipio (tabla estática lat/lng) + dropdown. Sin dependencia de mapas externos. Mapa interactivo (Leaflet + OpenStreetMap, gratis) → roadmap.

---

## 3. Modelo de datos (SQL portable: SQLite/D1 o Postgres/Supabase)
```sql
CREATE TABLE voluntario (
  id TEXT PRIMARY KEY, nombre TEXT NOT NULL, telefono_e164 TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'DISPONIBLE',         -- DISPONIBLE|OCUPADO|INACTIVO
  estado_geo TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL,
  geohash TEXT NOT NULL, radio_km INTEGER NOT NULL DEFAULT 15,
  token_gestion TEXT NOT NULL UNIQUE, verificado INTEGER NOT NULL DEFAULT 0,
  creado_en TEXT NOT NULL
);
CREATE TABLE voluntario_habilidad (
  voluntario_id TEXT NOT NULL REFERENCES voluntario(id) ON DELETE CASCADE,
  habilidad TEXT NOT NULL, PRIMARY KEY (voluntario_id, habilidad)
);
CREATE TABLE necesidad (
  id TEXT PRIMARY KEY, titulo TEXT NOT NULL, descripcion TEXT NOT NULL,
  habilidad TEXT NOT NULL, urgencia TEXT NOT NULL,    -- CRITICA|ALTA|MEDIA
  estado TEXT NOT NULL DEFAULT 'ABIERTA',             -- ABIERTA|ASIGNADA|RESUELTA|CANCELADA|EXPIRADA
  estado_geo TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL, geohash TEXT NOT NULL,
  contacto_e164 TEXT NOT NULL, token_gestion TEXT NOT NULL UNIQUE,
  caduca_en TEXT NOT NULL, creado_en TEXT NOT NULL
);
CREATE TABLE match (
  id TEXT PRIMARY KEY, necesidad_id TEXT NOT NULL REFERENCES necesidad(id),
  voluntario_id TEXT NOT NULL REFERENCES voluntario(id),
  estado TEXT NOT NULL DEFAULT 'PROPUESTO',           -- PROPUESTO|ACEPTADO|COMPLETADO|RECHAZADO
  creado_en TEXT NOT NULL
);
CREATE INDEX idx_vol_match  ON voluntario(estado, geohash);
CREATE INDEX idx_nec_listar ON necesidad(estado, urgencia, creado_en);
```
**Enum de habilidades:** `rescate_urbano`, `medico`, `paramedico`, `enfermeria`, `ingenieria_estructural`, `psicologia_primeros_auxilios`, `transporte`, `logistica`, `comunicaciones`, `voluntario_general`.

---

## 4. Diseño UI — sistema de tokens (skill: frontend-design)

**Tesis:** sala de coordinación de emergencia. Oscura, legible bajo estrés, donde el color **codifica triage** (no decora).

### Color (el naranja es la única voz alta; rojo/verde/ámbar = estados estrictos)
```css
:root{
  --bg-base:#0E1116; --bg-surface:#181C23; --bg-elevated:#222831; --border:#2C333D;
  --text:#F4F6F8; --text-muted:#9AA4B0;
  --primary:#FF6A2B; --primary-700:#D8531C;        /* acción */
  --critical:#E11D2A;                               /* solo CRITICA/peligro */
  --available:#25C281;                              /* solo DISPONIBLE/RESUELTA */
  --warning:#F2B233;                                /* avisos (guiño bandera) */
  --info:#2D7FF9;                                   /* informativo (guiño bandera) */
}
```
**Regla:** si un color aparece sin su significado de triage, está mal usado.

### Tipografía
- **Display:** `Archivo` (Google Fonts, **autohospedar woff2** — no depender de la red de Google en runtime).
- **Cuerpo:** system stack (cero bytes): `-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif`.
- **Datos/utilidad:** `ui-monospace,"SFMono-Regular","JetBrains Mono",monospace`.
- Escala: 12/14/16/20/28/40. Cuerpo base 16px mínimo.

### Layout y signature
- **Mobile-first** real (380px), una columna, botones ≥44px, contraste AA.
- Sin hero decorativo: el contenido *es* la urgencia.
- **Signature:** banda fina de pulso/sismógrafo bajo la barra superior; color según estado global (verde sin críticas, ámbar con críticas, rojo crítica sin voluntarios). Respeta `prefers-reduced-motion`.

### Copy
Voz activa, frases cortas, sin relleno. Estados vacíos accionables. Errores claros sin disculpas vagas.

---

## 5. Seguridad — OWASP Top 10 + anti-bot + privacidad (baseline obligatorio)

Cada endpoint de escritura: **Zod + Turnstile + rate limit** o no se mergea.

| # | Riesgo | Mitigación |
|---|---|---|
| A01 | Control de acceso / IDOR | Autorización en servidor por `token_gestion` opaco; validar pertenencia; RLS si Supabase. |
| A02 | Cripto | HTTPS + HSTS; tokens 128 bits (`getRandomValues`); sin PII en logs; secretos en env. |
| A03 | Inyección | Consultas parametrizadas; validación Zod en cada borde; React escapa salida. |
| A04 | Diseño inseguro | Casos de abuso (necesidades falsas, spam) → anti-bot, rate limit, caducidad, verificación. |
| A05 | Mala config | Headers: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. CORS mínimo, debug off. |
| A06 | Componentes vulnerables | Lockfile, `npm audit` en CI, Dependabot, superficie mínima. |
| A07 | Auth | MVP por token de enlace; OTP futuro con límite de intentos + expiración. |
| A08 | Integridad | Build reproducible; SRI para terceros; sin CDNs no confiables. |
| A09 | Logging/monitoreo | Logs sin PII; alerta ante picos anómalos; auditoría de matches. |
| A10 | SSRF | Sin fetch a URLs del usuario; lista blanca (`wa.me`, email). |

### Anti-bot / rate limit
- **Turnstile** en todos los formularios de escritura.
- **Rate limit por capas:** IP (5/10min, 20/h), teléfono (máx. 3 necesidades activas), regla WAF global.
- **Honeypot** + **time-trap** (<2 s rechazado).
- Validación teléfono VE: `^\+58(412|414|416|424|426|2\d{2})\d{7}$`.
- Caducidad automática 48 h.

### Privacidad (minimización)
Solo lo necesario para coordinar (sin cédula, solo municipio). Contacto del solicitante revelado **solo** al pulsar "Contactar". Purga de `RESUELTA/EXPIRADA` a los 7 días.

---

## 6. Convenciones de código
- TypeScript estricto (`strict: true`), prohibido `any`.
- Validación de entrada con **Zod** en cada borde HTTP.
- Casos de uso devuelven `Result<T, DomainError>` (no lanzar para flujo normal).
- Dominio en español (`Voluntario`, `Necesidad`, `Match`); utilidades genéricas en inglés.
- SQL siempre parametrizado.
- Sin dependencias pesadas en el MVP (mapas, UI kits grandes).

## 7. Comandos
`npm ci` · `npm run dev` · `npm test` · `npm run lint && npm run format` · `npm audit --omit=dev`
