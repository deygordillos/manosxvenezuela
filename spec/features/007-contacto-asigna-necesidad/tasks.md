# 007 · Contacto asigna necesidad — tasks.md

## Aplicación
- [x] Ajustar `GenerarContactoWhatsapp` para cambiar `ABIERTA → ASIGNADA`.
- [x] Bloquear `ASIGNADA` y estados cerrados.
- [x] Agregar error claro para necesidad ya atendida.

## Infraestructura
- [x] Actualizar repos D1/in-memory para cambio condicional si aplica.

## Interfaz
- [x] `POST /api/contacto/:id` devuelve aviso si ya está asignada/cerrada.
- [x] Home default deja de mostrar asignadas.

## Definition of Done
- [x] CA-1..CA-5 verificados.
- [x] Tests verdes.
