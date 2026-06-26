import { EstadoNecesidad, Necesidad } from "../../domain/entities/Necesidad";
import { renderPageShell } from "./layout/PageShell";

export function renderGestionNecesidadPage(params: {
  readonly necesidad: Necesidad | null;
  readonly tokenGestion?: string;
}): string {
  if (params.necesidad === null || params.tokenGestion === undefined) {
    return renderPageShell({
      title: "Gestion de necesidad | Manos",
      activePath: "/necesidad/nueva",
      styles: GESTION_NECESIDAD_CSS,
      body: `<main class="manage-shell"><section class="manage-card"><p class="eyebrow">Enlace invalido</p><h1>No encontramos esta necesidad.</h1><p class="lead">Revisa que el enlace de gestion este completo. No se expuso informacion de ninguna solicitud.</p><p><a href="/necesidad/nueva">Publicar una necesidad</a></p></section></main>`,
    });
  }

  return renderPageShell({
    title: "Gestion de necesidad | Manos",
    activePath: "/necesidad/nueva",
    styles: GESTION_NECESIDAD_CSS,
    body: `<main class="manage-shell">
    <section class="manage-card" aria-labelledby="manage-title">
      <p class="eyebrow">Gestion privada</p>
      <h1 id="manage-title">${escapeHtml(params.necesidad.titulo)}</h1>
      <dl class="status-grid">
        <div><dt>Zona</dt><dd>${escapeHtml(params.necesidad.zona.estadoGeo)}</dd></div>
        <div><dt>Estado actual</dt><dd>${params.necesidad.estado}</dd></div>
      </dl>
      <p class="lead">Usa este enlace solo si publicaste la necesidad. No compartimos telefono ni identificadores internos en esta pantalla.</p>
      <form method="post" action="/api/necesidad/estado" class="actions">
        <input type="hidden" name="tokenGestion" value="${escapeHtml(params.tokenGestion)}" />
        <button type="submit" name="estado" value="${EstadoNecesidad.Resuelta}">Marcar resuelta</button>
        <button type="submit" name="estado" value="${EstadoNecesidad.Cancelada}" class="secondary">Cancelar necesidad</button>
      </form>
    </section>
  </main>`,
  });
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export const GESTION_NECESIDAD_CSS = `
:root{--bg-base:#0E1116;--bg-surface:#181C23;--bg-elevated:#222831;--border:#2C333D;--text:#F4F6F8;--text-muted:#9AA4B0;--primary:#FF6A2B;--primary-700:#D8531C;--warning:#F2B233}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top right,#243244,var(--bg-base) 46%);color:var(--text);font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}.manage-shell{min-height:100svh;display:grid;place-items:center;padding:20px}.manage-card{width:min(100%,680px);display:grid;gap:18px;background:linear-gradient(180deg,var(--bg-surface),#10141a);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.38)}.eyebrow{margin:0;color:var(--warning);font:700 12px/1 ui-monospace,"SFMono-Regular",monospace;letter-spacing:.12em;text-transform:uppercase}h1{margin:0;font-size:clamp(28px,8vw,44px);line-height:1.04;letter-spacing:-.04em}.lead{margin:0;color:var(--text-muted);line-height:1.5}.status-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0}.status-grid div{padding:14px;border:1px solid var(--border);border-radius:14px;background:var(--bg-elevated)}dt{color:var(--text-muted);font:700 12px/1 ui-monospace,"SFMono-Regular",monospace;text-transform:uppercase}dd{margin:8px 0 0;font-weight:900}.actions{display:grid;grid-template-columns:1fr 1fr;gap:12px}button{min-height:48px;border:0;border-radius:12px;background:var(--primary);color:#180802;font:900 16px/1 -apple-system,"Segoe UI",sans-serif;cursor:pointer}.secondary{background:transparent;color:var(--text);border:1px solid var(--border)}a{color:var(--primary);font-weight:900}button:focus-visible,a:focus-visible{outline:3px solid color-mix(in srgb,var(--primary),white 20%);outline-offset:3px}@media (max-width:680px){.status-grid,.actions{grid-template-columns:1fr}.manage-card{padding:20px}}
`;
