# Manos — Spec Driven Development

Plataforma de emparejamiento de voluntarios ↔ necesidades · respuesta sísmica Venezuela (jun-2026).

## Estructura
```
manos/
├── AGENT.md                     ← guía para el agente de IA (Claude Code / Cursor)
├── spec/
│   ├── constitution/            ← reglas estables del proyecto
│   │   ├── mission.md           ← qué construimos y para quién
│   │   ├── tech-stack.md        ← tecnologías, arquitectura, diseño y seguridad
│   │   └── roadmap.md           ← orden de las features
│   └── features/                ← una carpeta por feature (slice vertical)
│       ├── 001-nucleo-emparejamiento/
│       │   ├── spec.md          ← qué hace + criterios de aceptación
│       │   ├── plan.md          ← cómo se implementa
│       │   └── tasks.md         ← checklist de tareas
│       ├── 002-registro-voluntario/
│       ├── 003-publicar-necesidad/
│       └── 004-listado-y-contacto/
└── app/                      ← el código que genera el agente
```

## Cómo usarlo
1. Lee `AGENT.md`.
2. Lee la constitución completa (`spec/constitution/`).
3. Implementa las features en el orden de `roadmap.md`, una a la vez.
4. Genera el código en `app/`.

## Levantar la web local
La app incluye un servidor de desarrollo con datos en memoria para ver los flujos en navegador.

```bash
npm run install:app
npm run dev
```

Abre `http://localhost:4321`.

Rutas útiles:
- `/` listado público de necesidades.
- `/voluntario/registro` registro de voluntario.
- `/necesidad/nueva` publicación de necesidad.

## Probar lo implementado
Las features 001–004 están cubiertas por tests unitarios/de handlers.

```bash
npm run install:app
npm test
```
