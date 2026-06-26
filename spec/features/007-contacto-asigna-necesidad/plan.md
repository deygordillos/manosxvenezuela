# 007 · Contacto asigna necesidad — plan.md

> Ajustar el flujo de contacto para hacer transición de estado atómica desde la capa de aplicación.

## Archivos
```
src/application/use-cases/GenerarContactoWhatsapp.ts
src/application/ports/NecesidadRepository.ts
src/infrastructure/persistence/D1NecesidadRepository.ts
src/interface/http/contacto.ts
tests/use-cases/GenerarContactoWhatsapp.test.ts
tests/interface/http/listado-contacto.test.ts
```

## Decisiones
- `GenerarContactoWhatsapp` valida estado antes de generar enlace.
- Si está `ABIERTA`, genera enlace y luego cambia estado a `ASIGNADA`.
- Si está `ASIGNADA`, no genera enlace.
- En D1, la actualización ideal debe ser condicional: `WHERE id=? AND estado='ABIERTA'` para evitar doble contacto concurrente.

## Pruebas
- Primer contacto exitoso cambia estado.
- Segundo contacto falla.
- Listado default ya no muestra la necesidad.
