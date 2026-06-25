import { type EstadoPulso } from "../../application/use-cases/ListarNecesidades";
import { Necesidad } from "../../domain/entities/Necesidad";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { MUNICIPIOS } from "../../shared/municipios";
import { BANDA_PULSO_CSS, renderBandaPulso } from "./components/BandaPulso";

export function renderListadoNecesidadesPage(params: {
  readonly necesidades: readonly Necesidad[];
  readonly estadoPulso: EstadoPulso;
  readonly now?: Date;
}): string {
  const now = params.now ?? new Date();
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Necesidades abiertas | Manos</title>
  <style>${BANDA_PULSO_CSS}${LISTADO_NECESIDADES_CSS}</style>
</head>
<body>
  <main class="board-shell">
    <header class="board-header">
      ${renderBandaPulso(params.estadoPulso)}
      <p class="eyebrow">Sala publica de coordinacion</p>
      <h1>Necesidades abiertas ahora.</h1>
      <p class="lead">El contacto no se muestra en el listado. Se revela solo al pulsar Contactar por WhatsApp.</p>
      <form class="filters" method="get" action="/">
        <label>Zona<select name="zona"><option value="">Todas</option>${renderZonas()}</select></label>
        <label>Habilidad<select name="habilidad"><option value="">Todas</option>${renderHabilidades()}</select></label>
        <button type="submit">Filtrar</button>
      </form>
    </header>
    <section class="cards" aria-label="Necesidades abiertas">
      ${params.necesidades.length === 0 ? renderEmpty() : params.necesidades.map((necesidad) => renderCard(necesidad, now)).join("")}
    </section>
  </main>
</body>
</html>`;
}

function renderCard(necesidad: Necesidad, now: Date): string {
  const antiguedadMin = Math.max(0, Math.floor((now.getTime() - necesidad.creadoEn.getTime()) / 60000));
  return `<article class="need-card urgency-${necesidad.urgencia.toLowerCase()}">
    <div class="meta"><span>${necesidad.urgencia}</span><span>${necesidad.habilidad.replaceAll("_", " ")}</span><span>${antiguedadMin} min</span></div>
    <h2>${escapeHtml(necesidad.titulo)}</h2>
    <p>${escapeHtml(necesidad.descripcion)}</p>
    <div class="zone">${escapeHtml(necesidad.zona.estadoGeo)}</div>
    <form method="post" action="/api/contacto/${escapeHtml(necesidad.id)}"><button type="submit">Contactar por WhatsApp</button></form>
  </article>`;
}

function renderEmpty(): string {
  return `<div class="empty"><strong>No hay necesidades abiertas con esos filtros.</strong><span>Comparte el registro de voluntarios o publica una necesidad nueva.</span></div>`;
}

function renderZonas(): string {
  return MUNICIPIOS.map((municipio) => `<option value="${escapeHtml(municipio.estadoGeo)}">${escapeHtml(municipio.estadoGeo)}</option>`).join("");
}

function renderHabilidades(): string {
  return Object.values(Habilidad).map((habilidad) => `<option value="${habilidad}">${habilidad.replaceAll("_", " ")}</option>`).join("");
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export const LISTADO_NECESIDADES_CSS = `
:root{--bg-base:#0E1116;--bg-surface:#181C23;--bg-elevated:#222831;--border:#2C333D;--text:#F4F6F8;--text-muted:#9AA4B0;--primary:#FF6A2B;--primary-700:#D8531C;--critical:#E11D2A;--available:#25C281;--warning:#F2B233;--info:#2D7FF9}*{box-sizing:border-box}body{margin:0;background:linear-gradient(135deg,#0E1116,#151a22 48%,#10131a);color:var(--text);font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}.board-shell{width:min(100%,1120px);margin:0 auto;padding:18px}.board-header{display:grid;gap:16px;padding:22px;border:1px solid var(--border);border-radius:18px;background:rgba(24,28,35,.92)}.eyebrow{margin:0;color:var(--warning);font:700 12px/1 ui-monospace,"SFMono-Regular",monospace;letter-spacing:.12em;text-transform:uppercase}h1{margin:0;font-size:clamp(30px,9vw,56px);line-height:.95;letter-spacing:-.05em}.lead{margin:0;color:var(--text-muted);line-height:1.5}.filters{display:grid;grid-template-columns:1fr 1fr auto;gap:12px;align-items:end}label{display:grid;gap:8px;font-weight:800}select,button{min-height:44px;border-radius:12px;border:1px solid var(--border);font:inherit}select{background:var(--bg-elevated);color:var(--text);padding:10px 12px}button{background:var(--primary);color:#180802;font-weight:900;padding:0 16px;cursor:pointer}select:focus,button:focus-visible{outline:3px solid color-mix(in srgb,var(--primary),white 20%);outline-offset:2px}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}.need-card{display:grid;gap:12px;padding:18px;border:1px solid var(--border);border-left-width:5px;border-radius:16px;background:var(--bg-surface)}.urgency-critica{border-left-color:var(--critical)}.urgency-alta{border-left-color:var(--warning)}.urgency-media{border-left-color:var(--info)}.meta{display:flex;flex-wrap:wrap;gap:8px}.meta span,.zone{border:1px solid var(--border);border-radius:999px;color:var(--text-muted);font:700 12px/1 ui-monospace,"SFMono-Regular",monospace;padding:7px 9px}.need-card h2{margin:0;font-size:22px;line-height:1.1}.need-card p{margin:0;color:var(--text-muted);line-height:1.45}.need-card form{margin:0}.need-card button{width:100%}.empty{grid-column:1/-1;display:grid;gap:8px;padding:24px;border:1px dashed var(--border);border-radius:16px;color:var(--text-muted)}.empty strong{color:var(--text)}@media (max-width:720px){.filters{grid-template-columns:1fr}.cards{grid-template-columns:1fr}.board-shell{padding:12px}.board-header{padding:18px}}@media (prefers-reduced-motion:no-preference){button{transition:background .18s ease,color .18s ease,transform .18s ease}button:hover{background:var(--primary-700);color:var(--text);transform:translateY(-1px)}}
`;
