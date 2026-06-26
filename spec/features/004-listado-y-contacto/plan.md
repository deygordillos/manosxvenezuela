# 004 · Listado público y contacto — plan.md

> **Cómo se implementa.** Lectura pública + generación del enlace `wa.me` (costo 0).

## Estado
Implementada en `app/` y verificada con `npm test`.

Nota: `GET /api/necesidades` no retorna el contacto del solicitante. El número se resuelve únicamente en `POST /api/contacto/:id`, validando que la necesidad siga activa.

## Archivos
```
src/application/use-cases/ListarNecesidades.ts
src/application/use-cases/GenerarContactoWhatsapp.ts
src/application/ports/Notificador.ts
src/infrastructure/notifications/WhatsappLinkNotifier.ts
src/interface/http/listado.ts                # GET /api/necesidades?zona=&habilidad=
src/interface/http/contacto.ts               # POST /api/contacto/:necesidadId -> { url }
src/interface/web/ListadoNecesidades.tsx     # home + banda signature
src/interface/web/components/BandaPulso.tsx
tests/use-cases/ListarNecesidades.test.ts
```

## `WhatsappLinkNotifier`
```ts
generarContacto(n: Necesidad, v?: Voluntario): EnlaceContacto {
  const numero = n.contactoE164.replace('+','');         // wa.me sin '+'
  const texto = encodeURIComponent(
    `Hola, soy voluntario de Manos. Vi tu necesidad "${n.titulo}" en ${n.zona.estadoGeo}. ¿Cómo puedo ayudar?`
  );
  return { url: `https://wa.me/${numero}?text=${texto}` };
}
```
- Implementa el port `Notificador` → costo 0, sin API de mensajería.
- El número se resuelve **solo** en `POST /api/contacto/:id`, validando que la necesidad siga `ABIERTA/ASIGNADA` (CA-5).

## Listado
- `GET /api/necesidades` ordena `CRITICA` primero (usa `idx_nec_listar`), filtra `estado=ABIERTA` y `caduca_en > now`.
- Filtros opcionales por `zona` y `habilidad`.
- **No** incluye `contacto_e164` en la respuesta.

## Banda de pulso (signature, design system §4)
- Estado global derivado: ¿hay críticas? ¿hay críticas sin voluntarios disponibles cerca?
- CSS animación suave; bajo `prefers-reduced-motion` queda estática.

## Rendimiento (bajo consumo de datos)
- Paginación corta (p. ej. 20), sin imágenes, HTML liviano, fuentes autohospedadas.
