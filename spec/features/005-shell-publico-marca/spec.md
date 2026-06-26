# 005 · Shell público de marca — spec.md

> Header/footer común para todas las páginas HTML ultra ligeras.

---

## Objetivo
Unificar la estructura pública de Manos con marca, navegación y autoría visible, manteniendo HTML server-rendered sin framework.

## Alcance
- Header global para `/`, `/voluntario/registro`, `/necesidad/nueva` y páginas de resultado dev.
- Footer global con autoría.
- Helpers compartidos de layout.

## Criterios de aceptación

**CA-1 · Header global**
- **Dado** cualquier página pública, **entonces** veo el título `ManosXVenezuela` y el subtítulo `Coordinamos voluntarios y necesidades para responder más rápido.`.

**CA-2 · Navegación principal**
- **Entonces** el header muestra enlaces a Inicio, Registrar voluntario y Publicar necesidad.

**CA-3 · Footer con autoría**
- **Entonces** el footer muestra `Desarrollado por Dey Gordillo` con enlace a `https://github.com/deygordillos`.

**CA-4 · HTML ultra ligero**
- **Entonces** no se introduce framework UI ni runtime cliente obligatorio.

**CA-5 · Accesibilidad básica**
- **Entonces** los enlaces tienen foco visible, el layout funciona en 380px y mantiene contraste AA.

## Reglas
- El shell es compartido, no copiado manualmente en cada página.
- Mantener el diseño de sala de coordinación de emergencia definido en `tech-stack.md` §4.
