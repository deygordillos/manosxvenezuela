import { Habilidad } from "../../domain/value-objects/Habilidad";
import { Urgencia } from "../../domain/value-objects/Urgencia";
import { MUNICIPIOS } from "../../shared/municipios";

export function renderPublicarNecesidadPage(turnstileSiteKey: string, timestamp = Date.now()): string {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Publicar necesidad | Manos</title>
  <style>${PUBLICAR_NECESIDAD_CSS}</style>
</head>
<body>
  <main class="need-shell">
    <section class="need-card" aria-labelledby="need-title">
      <div class="triage-strip" aria-hidden="true"></div>
      <a class="home-link" href="/">← Volver al inicio</a>
      <p class="eyebrow">Solicitud de apoyo</p>
      <h1 id="need-title">Publica una necesidad concreta.</h1>
      <p class="lead">Describe que hace falta, donde ocurre y que habilidad debe responder. El sistema mostrara voluntarios compatibles al instante.</p>
      <form method="post" action="/api/necesidad" class="need-form">
        <label>Titulo<input name="titulo" required minlength="3" maxlength="90" placeholder="Atencion medica en refugio" /></label>
        <label>Descripcion<textarea name="descripcion" required minlength="5" maxlength="600" rows="4"></textarea></label>
        <label>Habilidad requerida<select name="habilidad" required>${renderHabilidades()}</select></label>
        <fieldset>
          <legend>Urgencia</legend>
          <div class="urgencias">${renderUrgencias()}</div>
        </fieldset>
        <label>Municipio<select name="estadoGeo" required>${renderMunicipios()}</select></label>
        <label>Contacto WhatsApp<input name="contacto" inputmode="tel" placeholder="+584121234567" required /></label>
        <input class="trap" name="honeypot" tabindex="-1" autocomplete="off" />
        <input type="hidden" name="ts" value="${timestamp}" />
        <input type="hidden" name="turnstileSiteKey" value="${escapeHtml(turnstileSiteKey)}" />
        <button type="submit">Publicar y buscar voluntarios</button>
      </form>
      <aside class="empty-state"><strong>Sin coincidencias aun.</strong> Comparte el enlace de gestion con coordinadores y vuelve a intentar cuando entren mas voluntarios.</aside>
    </section>
  </main>
</body>
</html>`;
}

function renderHabilidades(): string {
  return Object.values(Habilidad)
    .map((habilidad) => `<option value="${habilidad}">${habilidad.replaceAll("_", " ")}</option>`)
    .join("");
}

function renderUrgencias(): string {
  return Object.values(Urgencia)
    .map((urgencia) => `<label class="urgencia ${urgencia.toLowerCase()}"><input type="radio" name="urgencia" value="${urgencia}" required />${urgencia}</label>`)
    .join("");
}

function renderMunicipios(): string {
  return MUNICIPIOS.map(
    (municipio) => `<option value="${escapeHtml(municipio.estadoGeo)}">${escapeHtml(municipio.estadoGeo)}</option>`,
  ).join("");
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export const PUBLICAR_NECESIDAD_CSS = `
:root{--bg-base:#0E1116;--bg-surface:#181C23;--bg-elevated:#222831;--border:#2C333D;--text:#F4F6F8;--text-muted:#9AA4B0;--primary:#FF6A2B;--primary-700:#D8531C;--critical:#E11D2A;--warning:#F2B233;--info:#2D7FF9;}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top left,#1f2937,var(--bg-base) 42%);color:var(--text);font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}.need-shell{min-height:100svh;padding:20px;display:grid;place-items:center}.need-card{width:min(100%,760px);background:linear-gradient(180deg,var(--bg-surface),#10141a);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.38)}.triage-strip{height:4px;margin:-24px -24px 18px;background:linear-gradient(90deg,var(--critical),var(--warning),var(--info));border-radius:18px 18px 0 0}.home-link{display:inline-flex;margin-bottom:18px;color:var(--text-muted);text-decoration:none;font-weight:800}.home-link:hover{color:var(--primary)}.home-link:focus-visible{outline:3px solid color-mix(in srgb,var(--primary),white 20%);outline-offset:3px;border-radius:8px}.eyebrow{margin:0 0 10px;color:var(--warning);font:700 12px/1 ui-monospace,"SFMono-Regular",monospace;letter-spacing:.12em;text-transform:uppercase}h1{margin:0;font-size:clamp(28px,8vw,40px);line-height:1.02;letter-spacing:-.04em}.lead{color:var(--text-muted);font-size:16px;line-height:1.5}.need-form{display:grid;gap:16px;margin-top:24px}label,legend{display:grid;gap:8px;font-weight:700}input,select,textarea{width:100%;min-height:44px;border:1px solid var(--border);border-radius:12px;background:var(--bg-elevated);color:var(--text);padding:10px 12px;font:inherit}textarea{resize:vertical}input:focus,select:focus,textarea:focus,button:focus-visible{outline:3px solid color-mix(in srgb,var(--primary),white 20%);outline-offset:2px}fieldset{border:1px solid var(--border);border-radius:14px;padding:14px}.urgencias{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.urgencia{display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--border);border-radius:12px;padding:12px;font-size:14px}.urgencia input{width:auto;min-height:auto}.critica{border-color:var(--critical)}.alta{border-color:var(--warning)}.media{border-color:var(--info)}.trap{position:absolute;left:-100vw}button{min-height:48px;border:0;border-radius:12px;background:var(--primary);color:#180802;font-weight:900;font-size:16px;cursor:pointer}.empty-state{margin-top:18px;border:1px dashed var(--border);border-radius:14px;padding:14px;color:var(--text-muted);line-height:1.5}button:hover{background:var(--primary-700);color:var(--text)}@media (max-width:420px){.need-shell{padding:12px}.need-card{padding:18px;border-radius:14px}.triage-strip{margin:-18px -18px 18px}.urgencias{grid-template-columns:1fr}}@media (prefers-reduced-motion:no-preference){button,.home-link{transition:color .18s ease,background .18s ease,transform .18s ease}button:hover{transform:translateY(-1px)}}
`;
