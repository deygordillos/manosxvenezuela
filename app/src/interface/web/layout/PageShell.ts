import { type ActivePath, HEADER_CSS, renderHeader } from "./Header";
import { FOOTER_CSS, renderFooter } from "./Footer";

export type PageShellParams = {
  readonly title: string;
  readonly activePath: ActivePath;
  readonly styles: string;
  readonly body: string;
};

export function renderPageShell(params: PageShellParams): string {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(params.title)}</title>
  <style>${HEADER_CSS}${FOOTER_CSS}${params.styles}</style>
</head>
<body>
  <div class="site-page">
    ${renderHeader(params.activePath)}
    ${params.body}
    ${renderFooter()}
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
