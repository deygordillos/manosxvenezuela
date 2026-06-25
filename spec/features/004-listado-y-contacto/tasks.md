# 004 · Listado público y contacto — tasks.md

## Aplicación
- [ ] Port `Notificador`.
- [ ] Caso de uso `ListarNecesidades` (orden + filtros) + test.
- [ ] Caso de uso `GenerarContactoWhatsapp` (valida estado activo).

## Infraestructura
- [ ] `WhatsappLinkNotifier` (genera `wa.me` URL-encoded).

## Interfaz
- [ ] `GET /api/necesidades` (sin contacto en respuesta).
- [ ] `POST /api/contacto/:id` → `{ url }` (resuelve número solo aquí).
- [ ] `ListadoNecesidades.tsx` (home) con filtros por zona/habilidad.
- [ ] `BandaPulso.tsx` (signature) con estados de color + `prefers-reduced-motion`.

## Privacidad/seguridad
- [ ] Contacto del solicitante nunca en listados.
- [ ] Aviso si la necesidad ya está cerrada (CA-5).

## Definition of Done
- [ ] CA-1..CA-5 verificados.
- [ ] HTML liviano, sin imágenes pesadas, fuentes autohospedadas.
- [ ] Mobile 380px, AA, foco visible.
- [ ] Tests verdes.
