# 005 · Shell público de marca — plan.md

> Extraer layout compartido para páginas HTML sin framework.

## Archivos
```
src/interface/web/layout/PageShell.ts
src/interface/web/layout/Header.ts
src/interface/web/layout/Footer.ts
tests/interface/web/PageShell.test.ts
```

## Decisiones
- `renderPageShell({ title, activePath, body })` compone documento HTML completo.
- `renderHeader(activePath)` contiene marca y navegación.
- `renderFooter()` contiene autoría y GitHub.
- CSS compartido vive junto al shell para seguir ultra ligero.
- Las páginas existentes pasan a renderizar solo su contenido principal.

## Páginas a migrar
- `ListadoNecesidades.tsx`
- `RegistroVoluntario.tsx`
- `PublicarNecesidad.tsx`
- Resultado dev en `dev-server.ts`

## Pruebas
- Header/footer aparecen en las tres páginas principales.
- El footer enlaza a `https://github.com/deygordillos`.
- No se agregan dependencias.
