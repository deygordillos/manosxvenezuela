export function renderFooter(): string {
  return `<footer class="site-footer">
    <span>Desarrollado por <a href="https://github.com/deygordillos" rel="me noopener noreferrer">Dey Gordillo</a></span>
  </footer>`;
}

export const FOOTER_CSS = `
.site-footer{width:min(100%,1120px);margin:16px auto 0;padding:16px 18px;color:var(--text-muted,#9AA4B0);text-align:center;font-size:14px}.site-footer a{color:var(--primary,#FF6A2B);font-weight:900;text-decoration:none}.site-footer a:hover{text-decoration:underline}.site-footer a:focus-visible{outline:3px solid color-mix(in srgb,var(--primary,#FF6A2B),white 20%);outline-offset:3px;border-radius:8px}
`;
