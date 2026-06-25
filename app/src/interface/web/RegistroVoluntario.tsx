import { Habilidad } from "../../domain/value-objects/Habilidad";
import { MUNICIPIOS } from "../../shared/municipios";

const HABILIDADES_LABEL: Record<Habilidad, string> = {
  [Habilidad.RescateUrbano]: "Rescate urbano",
  [Habilidad.Medico]: "Medico",
  [Habilidad.Paramedico]: "Paramedico",
  [Habilidad.Enfermeria]: "Enfermeria",
  [Habilidad.IngenieriaEstructural]: "Ingenieria estructural",
  [Habilidad.PsicologiaPrimerosAuxilios]: "Psicologia primeros auxilios",
  [Habilidad.Transporte]: "Transporte",
  [Habilidad.Logistica]: "Logistica",
  [Habilidad.Comunicaciones]: "Comunicaciones",
  [Habilidad.VoluntarioGeneral]: "Voluntario general",
};

export function renderRegistroVoluntarioPage(turnstileSiteKey: string, timestamp = Date.now()): string {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Registro de voluntario | Manos</title>
  <style>${REGISTRO_VOLUNTARIO_CSS}</style>
</head>
<body>
  <main class="registro-shell">
    <section class="registro-card" aria-labelledby="registro-title">
      <div class="pulse-strip" aria-hidden="true"></div>
      <p class="eyebrow">Canal de apoyo verificado</p>
      <h1 id="registro-title">Di que puedes hacer y donde estas.</h1>
      <p class="lead">Usaremos tus habilidades y tu radio de movimiento para avisarte solo cuando haya una necesidad compatible cerca.</p>
      <form method="post" action="/api/voluntario" class="registro-form">
        <label>Nombre completo<input name="nombre" autocomplete="name" required minlength="2" /></label>
        <label>Telefono WhatsApp<input name="telefono" inputmode="tel" autocomplete="tel" placeholder="+584121234567" required /></label>
        <fieldset>
          <legend>Habilidades</legend>
          <div class="chips">${renderHabilidades()}</div>
        </fieldset>
        <label>Municipio<select name="estadoGeo" required>${renderMunicipios()}</select></label>
        <label>Radio de respuesta<input name="radioKm" type="number" min="1" max="100" value="15" required /><span class="hint">Kilometros desde tu municipio.</span></label>
        <input class="trap" name="honeypot" tabindex="-1" autocomplete="off" />
        <input type="hidden" name="ts" value="${timestamp}" />
        <input type="hidden" name="turnstileSiteKey" value="${escapeHtml(turnstileSiteKey)}" />
        <button type="submit">Registrarme como disponible</button>
      </form>
    </section>
  </main>
</body>
</html>`;
}

function renderHabilidades(): string {
  return Object.values(Habilidad)
    .map(
      (habilidad) =>
        `<label class="chip"><input type="checkbox" name="habilidades" value="${habilidad}" />${HABILIDADES_LABEL[habilidad]}</label>`,
    )
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

export const REGISTRO_VOLUNTARIO_CSS = `
:root{--bg-base:#0E1116;--bg-surface:#181C23;--bg-elevated:#222831;--border:#2C333D;--text:#F4F6F8;--text-muted:#9AA4B0;--primary:#FF6A2B;--primary-700:#D8531C;--available:#25C281;--warning:#F2B233;}
*{box-sizing:border-box}body{margin:0;background:var(--bg-base);color:var(--text);font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}.registro-shell{min-height:100svh;padding:20px;display:grid;place-items:center}.registro-card{width:min(100%,720px);background:linear-gradient(180deg,var(--bg-surface),#11151b);border:1px solid var(--border);border-radius:18px;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.35)}.pulse-strip{height:4px;margin:-24px -24px 24px;background:linear-gradient(90deg,var(--available),var(--warning),var(--primary));border-radius:18px 18px 0 0}.eyebrow{margin:0 0 10px;color:var(--warning);font:700 12px/1 ui-monospace,"SFMono-Regular",monospace;letter-spacing:.12em;text-transform:uppercase}h1{margin:0;font-size:clamp(28px,8vw,40px);line-height:1.02;letter-spacing:-.04em}.lead{color:var(--text-muted);font-size:16px;line-height:1.5}.registro-form{display:grid;gap:16px;margin-top:24px}label,legend{display:grid;gap:8px;font-weight:700}input,select{width:100%;min-height:44px;border:1px solid var(--border);border-radius:12px;background:var(--bg-elevated);color:var(--text);padding:10px 12px;font:inherit}input:focus,select:focus,button:focus-visible{outline:3px solid color-mix(in srgb,var(--primary),white 20%);outline-offset:2px}fieldset{border:1px solid var(--border);border-radius:14px;padding:14px}.chips{display:flex;flex-wrap:wrap;gap:10px}.chip{display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:999px;padding:10px 12px;background:#121720;font-size:14px}.chip input{width:auto;min-height:auto}.hint{color:var(--text-muted);font-size:12px;font-weight:400}.trap{position:absolute;left:-100vw}button{min-height:48px;border:0;border-radius:12px;background:var(--primary);color:#180802;font-weight:900;font-size:16px;cursor:pointer}button:hover{background:var(--primary-700);color:var(--text)}@media (max-width:420px){.registro-shell{padding:12px}.registro-card{padding:18px;border-radius:14px}.pulse-strip{margin:-18px -18px 18px}}@media (prefers-reduced-motion:no-preference){button{transition:background .18s ease,color .18s ease,transform .18s ease}button:hover{transform:translateY(-1px)}}
`;
