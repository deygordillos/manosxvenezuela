import { type EstadoPulso } from "../../../application/use-cases/ListarNecesidades";

export function renderBandaPulso(estado: EstadoPulso): string {
  const label = estado === "verde" ? "Sin criticas activas" : estado === "ambar" ? "Criticas activas" : "Critica sin voluntarios cerca";
  return `<div class="pulse-band pulse-${estado}" role="status" aria-label="${label}"><span></span></div>`;
}

export const BANDA_PULSO_CSS = `
.pulse-band{height:5px;border-radius:999px;overflow:hidden;background:#2C333D}.pulse-band span{display:block;width:45%;height:100%;border-radius:999px}.pulse-verde span{background:#25C281}.pulse-ambar span{background:#F2B233}.pulse-rojo span{background:#E11D2A}@media (prefers-reduced-motion:no-preference){.pulse-band span{animation:pulse-scan 2.4s ease-in-out infinite}@keyframes pulse-scan{0%{transform:translateX(-110%)}50%{transform:translateX(80%)}100%{transform:translateX(230%)}}}
`;
