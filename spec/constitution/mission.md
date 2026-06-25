# mission.md — Qué construimos y para quién

> Constitución de **Manos** · Respuesta sísmica Venezuela (24-jun-2026)
> Este documento define el *porqué* y el *para quién*. No cambia con cada feature.

---

## El problema
El 24 de junio de 2026 dos terremotos (M7,2 y M7,5) golpearon la región central de Carabobo con daños estructurales en Caracas y derrumbes confirmados. En desastres la ayuda no falla por falta de voluntarios sino por **falta de coordinación**: rescatistas, médicos, ingenieros estructurales, paramédicos, conductores y logistas existen, pero no saben *dónde* ni *qué* se necesita ahora mismo.

## La misión
**Manos** conecta, en minutos, a un voluntario con la **habilidad correcta** y la **cercanía correcta** con una **necesidad concreta y verificada**.

## Para quién (audiencias)
- **Voluntarios especializados**: quieren ayudar pero necesitan saber dónde son útiles *ya*.
- **Personas afectadas y coordinadores**: tienen una necesidad concreta y necesitan la habilidad correcta cerca.
- **Moderadores**: verifican necesidades críticas para que la plataforma no amplifique el caos.

## Restricción rectora (define todo el diseño)
Internet intermitente, cortes de luz, datos caros, teléfonos gama baja y predominio de WhatsApp. Todo debe ser **liviano, WhatsApp-first, de bajo consumo de datos y alcanzable desde Venezuela**. La prioridad #1 de infraestructura es que **los venezolanos puedan acceder al servicio**.

## Identidad
| Campo | Valor |
|---|---|
| Nombre | **Manos** |
| Tagline | *Manos que llegan donde se necesitan.* |
| Dominio (compra instantánea) | `manosve.org` (~12 USD/año) |
| Identidad nacional (futuro) | `manos.org.ve` |
| Alternativas | `redmanos.org`, `manosya.org`, `brigadave.org` |

## Alcance del MVP ("en horas")
1. Registro de voluntario (habilidades, zona, radio, disponibilidad).
2. Publicación de necesidad (habilidad requerida, zona, urgencia, contacto).
3. Emparejamiento automático por habilidad + cercanía + disponibilidad.
4. Contacto vía WhatsApp con enlace directo `wa.me` (costo 0).
5. Estados de necesidad (abierta → asignada → resuelta) y de voluntario (disponible/ocupado).

## No-objetivos (explícito)
- **No** es un buscador de personas desaparecidas.
- **No** reemplaza a Protección Civil ni a cuerpos oficiales; los complementa.
- **No** almacena datos sensibles más allá de lo mínimo para coordinar.
- **No** incluye mapa interactivo, OTP ni panel de coordinadores en el MVP (ver `roadmap.md`).

## Principio de éxito
Una persona en la calle, con un teléfono gama baja y datos limitados, publica una necesidad y obtiene el contacto de un voluntario compatible **en menos de 2 minutos**.
