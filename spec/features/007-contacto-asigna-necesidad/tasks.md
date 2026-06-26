# 007 · Contacto asigna necesidad — tasks.md

## Aplicación
- [ ] Ajustar `GenerarContactoWhatsapp` para cambiar `ABIERTA → ASIGNADA`.
- [ ] Bloquear `ASIGNADA` y estados cerrados.
- [ ] Agregar error claro para necesidad ya atendida.

## Infraestructura
- [ ] Actualizar repos D1/in-memory para cambio condicional si aplica.

## Interfaz
- [ ] `POST /api/contacto/:id` devuelve aviso si ya está asignada/cerrada.
- [ ] Home default deja de mostrar asignadas.

## Definition of Done
- [ ] CA-1..CA-5 verificados.
- [ ] Tests verdes.
