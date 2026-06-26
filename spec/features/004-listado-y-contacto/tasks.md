# 004 · Listado público y contacto — tasks.md

## Aplicación
- [x] Port `Notificador`.
- [x] Caso de uso `ListarNecesidades` (orden + filtros) + test.
- [x] Caso de uso `GenerarContactoWhatsapp` (valida estado activo).

## Infraestructura
- [x] `WhatsappLinkNotifier` (genera `wa.me` URL-encoded).

## Interfaz
- [x] `GET /api/necesidades` (sin contacto en respuesta).
- [x] `POST /api/contacto/:id` → `{ url }` (resuelve número solo aquí).
- [x] `ListadoNecesidades.tsx` (home) con filtros por zona/habilidad.
- [x] `BandaPulso.tsx` (signature) con estados de color + `prefers-reduced-motion`.

## Privacidad/seguridad
- [x] Contacto del solicitante nunca en listados.
- [x] Aviso si la necesidad ya está cerrada (CA-5).

## Definition of Done
- [x] CA-1..CA-5 verificados.
- [x] HTML liviano, sin imágenes pesadas, fuentes autohospedadas.
- [x] Mobile 380px, AA, foco visible.
- [x] Tests verdes.
