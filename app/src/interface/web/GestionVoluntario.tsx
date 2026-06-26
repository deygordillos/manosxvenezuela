import { EstadoVoluntario, Voluntario } from "../../domain/entities/Voluntario";
import { renderPageShell } from "./layout/PageShell";

export function renderGestionVoluntarioPage(params: {
  readonly voluntario: Voluntario | null;
  readonly tokenGestion?: string;
}): string {
  if (params.voluntario === null || params.tokenGestion === undefined) {
    return renderPageShell({
      title: "Gestion de voluntario | Manos",
      activePath: "/voluntario/registro",
      styles: GESTION_VOLUNTARIO_CSS,
      body: `<main class="manage-shell"><section class="manage-card"><p class="eyebrow">Enlace invalido</p><h1>No encontramos este perfil.</h1><p class="lead">Revisa que el enlace de gestion este completo. No se expuso informacion de ningun voluntario.</p><p><a href="/voluntario/registro">Registrar voluntario</a></p></section></main>`,
    });
  }

  return renderPageShell({
    title: "Gestion de voluntario | Manos",
    activePath: "/voluntario/registro",
    styles: GESTION_VOLUNTARIO_CSS,
    body: `<main class="manage-shell">
    <section class="manage-card" aria-labelledby="manage-title">
      <p class="eyebrow">Disponibilidad privada</p>
      <h1 id="manage-title">${escapeHtml(params.voluntario.nombre)}</h1>
      <dl class="status-grid">
        <div><dt>Estado actual</dt><dd>${params.voluntario.estado}</dd></div>
        <div><dt>Habilidades</dt><dd>${renderHabilidades(params.voluntario)}</dd></div>
      </dl>
      <p class="lead">Cambia tu disponibilidad operativa. Solo los perfiles disponibles aparecen en emparejamientos compatibles.</p>
      <form method="post" action="/api/voluntario/estado" class="actions">
        <input type="hidden" name="tokenGestion" value="${escapeHtml(params.tokenGestion)}" />
        <button type="submit" name="estado" value="${EstadoVoluntario.Disponible}">Estoy disponible</button>
        <button type="submit" name="estado" value="${EstadoVoluntario.Ocupado}" class="secondary">Estoy ocupado</button>
        <button type="submit" name="estado" value="${EstadoVoluntario.Inactivo}" class="secondary">Pausar perfil</button>
      </form>
    </section>
  </main>`,
  });
}

function renderHabilidades(voluntario: Voluntario): string {
  return [...voluntario.habilidades].map((habilidad) => escapeHtml(habilidad.replaceAll("_", " "))).join(", ");
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export const GESTION_VOLUNTARIO_CSS = `
:root{--bg-base:#0E1116;--bg-surface:#181C23;--bg-elevated:#222831;--border:#2C333D;--text:#F4F6F8;--text-muted:#9AA4B0;--primary:#FF6A2B;--primary-700:#D8531C;--available:#25C281;--warning:#F2B233}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top left,#1d3b33,var(--bg-base) 44%);color:var(--text);font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}.manage-shell{min-height:100svh;display:grid;place-items:center;padding:20px}.manage-card{width:min(100%,720px);display:grid;gap:18px;background:linear-gradient(180deg,var(--bg-surface),#10141a);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.38)}.eyebrow{margin:0;color:var(--available);font:700 12px/1 ui-monospace,"SFMono-Regular",monospace;letter-spacing:.12em;text-transform:uppercase}h1{margin:0;font-size:clamp(28px,8vw,44px);line-height:1.04;letter-spacing:-.04em}.lead{margin:0;color:var(--text-muted);line-height:1.5}.status-grid{display:grid;grid-template-columns:1fr 1.4fr;gap:12px;margin:0}.status-grid div{padding:14px;border:1px solid var(--border);border-radius:14px;background:var(--bg-elevated)}dt{color:var(--text-muted);font:700 12px/1 ui-monospace,"SFMono-Regular",monospace;text-transform:uppercase}dd{margin:8px 0 0;font-weight:900}.actions{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}button{min-height:48px;border:0;border-radius:12px;background:var(--primary);color:#180802;font:900 16px/1 -apple-system,"Segoe UI",sans-serif;cursor:pointer}.secondary{background:transparent;color:var(--text);border:1px solid var(--border)}a{color:var(--primary);font-weight:900}button:focus-visible,a:focus-visible{outline:3px solid color-mix(in srgb,var(--primary),white 20%);outline-offset:3px}@media (max-width:760px){.status-grid,.actions{grid-template-columns:1fr}.manage-card{padding:20px}}
`;
