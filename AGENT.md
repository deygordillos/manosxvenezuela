# AGENT.md — Manos

## Qué es
Plataforma de emparejamiento de voluntarios especializados con necesidades tras el
terremoto de Venezuela (jun-2026).

## Cómo leer este repo (orden obligatorio)
1. `spec/constitution/mission.md` — qué construimos y para quién.
2. `spec/constitution/tech-stack.md` — arquitectura, stack, diseño y seguridad. **Reglas que toda feature cumple.**
3. `spec/constitution/roadmap.md` — orden de las features.
4. La feature activa en `spec/features/NNN-*/` (`spec.md` → `plan.md` → `tasks.md`).
5. Generar el código en `app/` siguiendo la estructura de `tech-stack.md` §1.

**La constitución manda.** Si el código contradice la constitución, detente y actualiza la constitución primero (mismo PR).

## Principios no negociables
- **Clean Architecture**: `domain ← application ← infrastructure/interface`. `domain` NO importa frameworks.
- **Desacople vía PORTS**: cambiar Supabase↔D1 toca solo `infrastructure/persistence`.
- **Mobile-first**, bajo consumo de datos, **WhatsApp-first** (`wa.me`, costo 0).
- **Seguridad por defecto** (OWASP, `tech-stack.md` §5): ningún endpoint de escritura sin Zod + Turnstile + rate limit.
- **Gratis primero**: no introducir servicios de pago sin marcarlo y justificarlo.

## Flujo de trabajo por feature (SDD)
- Implementa **una feature a la vez**, en el orden de `roadmap.md`.
- Cada tarea de `tasks.md` debe mapear a un criterio de aceptación de `spec.md`.
- Definition of Done por feature: CA cumplidos + tests verdes + baseline de seguridad aplicado + mobile 380px/AA.

## GitHub Flow y commits
- Usa GitHub Flow: crear una rama corta desde `master`/`main`, commitear ahí, hacer push a `origin` y abrir PR antes de mergear.
- No commitear directo a la rama base salvo instrucción explícita.
- Nombrar ramas con prefijo semántico y descripción corta: `feat/...`, `fix/...`, `docs/...`, `chore/...`.
- Los commits siguen Conventional Commits: `<tipo>[ámbito opcional]: <descripción>`.
- Tipos principales: `feat` para funcionalidades y `fix` para correcciones.
- Tipos permitidos de soporte: `docs`, `test`, `refactor`, `perf`, `style`, `build`, `ci`, `chore`.
- Cambios incompatibles deben incluir `BREAKING CHANGE: ...` en cuerpo o pie.
- Antes de commitear: revisar `git status --short`, `git diff`, `git log --oneline -10`, stagear solo archivos intencionales y correr pruebas relevantes.
- Usar la skill local `conventional-commits` cuando se creen o revisen mensajes de commit, ramas o PRs.

## Convenciones
- TypeScript `strict`, sin `any`. Zod en cada borde. `Result<T,DomainError>` en casos de uso.
- Dominio en español (`Voluntario`, `Necesidad`, `Match`); utilidades genéricas en inglés.
- SQL parametrizado. Secretos solo en env. Sin PII en logs.
- No depender de Google Fonts en runtime (autohospedar `woff2`).

## Comandos
`npm ci` · `npm run dev` · `npm test` · `npm run lint && npm run format` · `npm audit --omit=dev`

## Lo que NO debes hacer
- No exponer IDs internos para mutaciones; usar `token_gestion` opaco.
- No revelar el contacto del solicitante en listados públicos (solo al "Contactar").
- No añadir dependencias pesadas (mapas, UI kits grandes) en el MVP.
- No registrar PII en logs.
