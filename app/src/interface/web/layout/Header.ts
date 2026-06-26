export type ActivePath = "/" | "/voluntario/registro" | "/necesidad/nueva";

const NAV_ITEMS: readonly { readonly href: ActivePath; readonly label: string }[] = [
  { href: "/", label: "Inicio" },
  { href: "/voluntario/registro", label: "Registrar voluntario" },
  { href: "/necesidad/nueva", label: "Publicar necesidad" },
];

export function renderHeader(activePath: ActivePath): string {
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="ManosXVenezuela inicio">
      <strong>ManosXVenezuela</strong>
      <span>Coordinamos voluntarios y necesidades para responder más rápido.</span>
    </a>
    <nav class="site-nav" aria-label="Navegación principal">
      ${NAV_ITEMS.map(
        (item) =>
          `<a href="${item.href}"${item.href === activePath ? ' aria-current="page"' : ""}>${item.label}</a>`,
      ).join("")}
    </nav>
  </header>`;
}

export const HEADER_CSS = `
.site-header{width:min(100%,1120px);margin:0 auto 14px;padding:16px 18px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;border:1px solid var(--border,#2C333D);border-radius:18px;background:rgba(24,28,35,.94)}.brand{display:grid;gap:5px;color:var(--text,#F4F6F8);text-decoration:none}.brand strong{font-size:22px;line-height:1;letter-spacing:-.04em}.brand span{color:var(--text-muted,#9AA4B0);font-size:14px;line-height:1.35}.site-nav{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}.site-nav a{min-height:40px;display:inline-flex;align-items:center;border:1px solid var(--border,#2C333D);border-radius:999px;padding:9px 12px;color:var(--text,#F4F6F8);text-decoration:none;font-weight:800;font-size:14px}.site-nav a[aria-current="page"]{background:var(--primary,#FF6A2B);border-color:var(--primary,#FF6A2B);color:#180802}.site-nav a:focus-visible,.brand:focus-visible{outline:3px solid color-mix(in srgb,var(--primary,#FF6A2B),white 20%);outline-offset:3px}@media (max-width:720px){.site-header{grid-template-columns:1fr}.site-nav{justify-content:flex-start}.site-nav a{flex:1;justify-content:center}}
`;
