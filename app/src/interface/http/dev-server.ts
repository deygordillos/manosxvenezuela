import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { AntiBot } from "../../application/ports/AntiBot";
import { NecesidadRepository } from "../../application/ports/NecesidadRepository";
import { RateLimiter } from "../../application/ports/RateLimiter";
import { type CriterioMatch, type VoluntarioRepository } from "../../application/ports/VoluntarioRepository";
import { ListarNecesidades } from "../../application/use-cases/ListarNecesidades";
import { EstadoNecesidad, Necesidad } from "../../domain/entities/Necesidad";
import { EstadoVoluntario, Voluntario } from "../../domain/entities/Voluntario";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { TelefonoVE } from "../../domain/value-objects/TelefonoVE";
import { Urgencia } from "../../domain/value-objects/Urgencia";
import { Zona } from "../../domain/value-objects/Zona";
import { EdgeRateLimiter } from "../../infrastructure/security/EdgeRateLimiter";
import { MUNICIPIOS } from "../../shared/municipios";
import { getNecesidades } from "./listado";
import { postContacto } from "./contacto";
import { postNecesidad } from "./necesidad";
import { postVoluntario } from "./voluntario";
import { renderListadoNecesidadesPage } from "../web/ListadoNecesidades";
import { renderPublicarNecesidadPage } from "../web/PublicarNecesidad";
import { renderRegistroVoluntarioPage } from "../web/RegistroVoluntario";

const PORT = Number(process.env.PORT ?? 4321);
const BASE_URL = `http://localhost:${PORT}`;

let voluntarios: VoluntarioRepository;
let necesidades: NecesidadRepository;
const antiBot: AntiBot = { verificar: async () => ({ success: true }) };
let registroLimiter: RateLimiter;
let necesidadLimiter: RateLimiter;

async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", BASE_URL);

  if (req.method === "GET" && url.pathname === "/") {
    const listado = await new ListarNecesidades(necesidades, voluntarios).ejecutar(new Date(), {
      zona: optionalParam(url.searchParams.get("zona")),
      habilidad: parseHabilidadParam(url.searchParams.get("habilidad")),
    });
    sendHtml(res, renderListadoNecesidadesPage({ ...listado, now: new Date() }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/voluntario/registro") {
    sendHtml(res, renderRegistroVoluntarioPage("local-dev", Date.now() - 3000));
    return;
  }

  if (req.method === "GET" && url.pathname === "/necesidad/nueva") {
    sendHtml(res, renderPublicarNecesidadPage("local-dev", Date.now() - 3000));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/necesidades") {
    const response = await getNecesidades(
      {
        now: Date.now(),
        query: {
          zona: optionalParam(url.searchParams.get("zona")),
          habilidad: optionalParam(url.searchParams.get("habilidad")),
        },
      },
      { necesidades, voluntarios },
    );
    sendJson(res, response.status, response.body);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/voluntario") {
    const form = await readForm(req);
    const response = await postVoluntario(
      { ip: clientIp(req), now: Date.now(), body: voluntarioBody(form) },
      {
        repo: voluntarios,
        antiBot,
        rateLimiter: registroLimiter,
        generarId: () => `vol-${Date.now()}`,
        generarTokenGestion: () => `dev-token-vol-${Date.now()}-${Math.random().toString(16).slice(2)}`.padEnd(32, "0"),
        baseUrl: BASE_URL,
      },
    );
    sendHtml(res, renderDevResult("Registro de voluntario", response.status, response.body));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/necesidad") {
    const form = await readForm(req);
    const response = await postNecesidad(
      { ip: clientIp(req), now: Date.now(), body: necesidadBody(form) },
      {
        necesidades,
        voluntarios,
        antiBot,
        rateLimiter: necesidadLimiter,
        generarId: () => `nec-${Date.now()}`,
        generarTokenGestion: () => `dev-token-nec-${Date.now()}-${Math.random().toString(16).slice(2)}`.padEnd(32, "0"),
        baseUrl: BASE_URL,
      },
    );
    sendHtml(res, renderDevResult("Publicacion de necesidad", response.status, response.body));
    return;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/contacto/")) {
    const necesidadId = decodeURIComponent(url.pathname.replace("/api/contacto/", ""));
    const response = await postContacto({ params: { necesidadId } }, { necesidades });
    if (response.status === 200 && isUrlBody(response.body)) {
      res.writeHead(303, { Location: response.body.url });
      res.end();
      return;
    }

    sendHtml(res, renderDevResult("Contacto", response.status, response.body));
    return;
  }

  sendText(res, 404, "No encontrado");
}

function voluntarioBody(form: URLSearchParams): Record<string, unknown> {
  return {
    nombre: form.get("nombre") ?? "",
    telefono: form.get("telefono") ?? "",
    habilidades: form.getAll("habilidades"),
    estadoGeo: form.get("estadoGeo") ?? "",
    radioKm: Number(form.get("radioKm") ?? 15),
    honeypot: form.get("honeypot") ?? "",
    ts: Number(form.get("ts") ?? Date.now() - 3000),
    turnstileToken: "local-dev",
  };
}

function necesidadBody(form: URLSearchParams): Record<string, unknown> {
  return {
    titulo: form.get("titulo") ?? "",
    descripcion: form.get("descripcion") ?? "",
    habilidad: form.get("habilidad") ?? "",
    estadoGeo: form.get("estadoGeo") ?? "",
    urgencia: form.get("urgencia") ?? "",
    contacto: form.get("contacto") ?? "",
    honeypot: form.get("honeypot") ?? "",
    ts: Number(form.get("ts") ?? Date.now() - 3000),
    turnstileToken: "local-dev",
  };
}

function renderDevResult(title: string, status: number, body: unknown): string {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>body{margin:0;background:#0E1116;color:#F4F6F8;font-family:-apple-system,"Segoe UI",sans-serif;padding:24px}main{max-width:760px;margin:auto;background:#181C23;border:1px solid #2C333D;border-radius:16px;padding:20px}a{color:#FF6A2B}pre{white-space:pre-wrap;background:#222831;border-radius:12px;padding:14px}</style></head><body><main><h1>${title}</h1><p>Estado HTTP: ${status}</p><pre>${escapeHtml(JSON.stringify(body, null, 2))}</pre><p><a href="/">Volver al listado</a></p></main></body></html>`;
}

async function readForm(req: IncomingMessage): Promise<URLSearchParams> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

function sendHtml(res: ServerResponse, html: string): void {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function sendText(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(body);
}

function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  return Array.isArray(forwarded) ? forwarded[0] ?? "127.0.0.1" : forwarded ?? req.socket.remoteAddress ?? "127.0.0.1";
}

function optionalParam(value: string | null): string | undefined {
  return value === null || value === "" ? undefined : value;
}

function parseHabilidadParam(value: string | null): Habilidad | undefined {
  return Object.values(Habilidad).includes(value as Habilidad) ? (value as Habilidad) : undefined;
}

function isUrlBody(body: unknown): body is { readonly url: string } {
  return typeof body === "object" && body !== null && "url" in body && typeof body.url === "string";
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

class DevVoluntarioRepository implements VoluntarioRepository {
  private readonly voluntarios = new Map<string, Voluntario>();

  constructor(voluntariosIniciales: readonly Voluntario[]) {
    for (const voluntario of voluntariosIniciales) {
      this.voluntarios.set(voluntario.id, voluntario);
    }
  }

  async guardar(voluntario: Voluntario): Promise<void> {
    this.voluntarios.set(voluntario.id, voluntario);
  }

  async buscarPorTokenGestion(tokenGestion: string): Promise<Voluntario | null> {
    return [...this.voluntarios.values()].find((voluntario) => voluntario.tokenGestion === tokenGestion) ?? null;
  }

  async buscarCompatibles(criterio: CriterioMatch): Promise<Voluntario[]> {
    return [...this.voluntarios.values()].filter(
      (voluntario) => voluntario.estado === criterio.estado && voluntario.tieneHabilidad(criterio.habilidad),
    );
  }

  async cambiarEstado(id: string, estado: EstadoVoluntario): Promise<void> {
    const actual = this.voluntarios.get(id);
    if (actual === undefined) return;
    const actualizado = Voluntario.crear({
      id: actual.id,
      nombre: actual.nombre,
      telefono: actual.telefono,
      habilidades: [...actual.habilidades],
      estado,
      zona: actual.zona,
      radioKm: actual.radioKm,
      tokenGestion: actual.tokenGestion,
      creadoEn: actual.creadoEn,
    });
    if (actualizado.ok) this.voluntarios.set(id, actualizado.value);
  }
}

class DevNecesidadRepository implements NecesidadRepository {
  private readonly necesidades = new Map<string, Necesidad>();

  constructor(necesidadesIniciales: readonly Necesidad[]) {
    for (const necesidad of necesidadesIniciales) {
      this.necesidades.set(necesidad.id, necesidad);
    }
  }

  async guardar(necesidad: Necesidad): Promise<void> {
    this.necesidades.set(necesidad.id, necesidad);
  }

  async buscarPorId(id: string): Promise<Necesidad | null> {
    return this.necesidades.get(id) ?? null;
  }

  async buscarPorTokenGestion(tokenGestion: string): Promise<Necesidad | null> {
    return [...this.necesidades.values()].find((necesidad) => necesidad.tokenGestion === tokenGestion) ?? null;
  }

  async contarActivasPorContacto(contacto: TelefonoVE, now: Date): Promise<number> {
    return [...this.necesidades.values()].filter(
      (necesidad) => necesidad.contacto.value === contacto.value && necesidad.estado === EstadoNecesidad.Abierta && necesidad.caducaEn > now,
    ).length;
  }

  async cambiarEstado(id: string, estado: EstadoNecesidad): Promise<void> {
    const actual = this.necesidades.get(id);
    if (actual === undefined) return;
    const actualizado = Necesidad.crear({
      id: actual.id,
      titulo: actual.titulo,
      descripcion: actual.descripcion,
      habilidad: actual.habilidad,
      urgencia: actual.urgencia,
      estado,
      zona: actual.zona,
      contacto: actual.contacto,
      tokenGestion: actual.tokenGestion,
      caducaEn: actual.caducaEn,
      creadoEn: actual.creadoEn,
    });
    if (actualizado.ok) this.necesidades.set(id, actualizado.value);
  }

  async expirarVencidas(now: Date): Promise<number> {
    let total = 0;
    for (const necesidad of this.necesidades.values()) {
      if (necesidad.estado === EstadoNecesidad.Abierta && necesidad.caducaEn <= now) {
        await this.cambiarEstado(necesidad.id, EstadoNecesidad.Expirada);
        total += 1;
      }
    }
    return total;
  }

  async listarAbiertasVigentes(now: Date): Promise<Necesidad[]> {
    return [...this.necesidades.values()].filter(
      (necesidad) => necesidad.estado === EstadoNecesidad.Abierta && necesidad.caducaEn > now,
    );
  }
}

function crearVoluntarioDemo(): Voluntario {
  const telefono = TelefonoVE.crear("+584121234567");
  const zona = zonaDemo("Distrito Capital/Caracas");
  if (!telefono.ok) throw new Error("Telefono demo invalido");
  const voluntario = Voluntario.crear({
    id: "vol-demo-medico",
    nombre: "Voluntaria demo",
    telefono: telefono.value,
    habilidades: [Habilidad.Medico, Habilidad.VoluntarioGeneral],
    estado: EstadoVoluntario.Disponible,
    zona,
    radioKm: 20,
    tokenGestion: "token-vol-demo",
  });
  if (!voluntario.ok) throw new Error("Voluntario demo invalido");
  return voluntario.value;
}

function crearNecesidadDemo(): Necesidad {
  const contacto = TelefonoVE.crear("+584221234567");
  const zona = zonaDemo("Distrito Capital/Caracas");
  if (!contacto.ok) throw new Error("Contacto demo invalido");
  const necesidad = Necesidad.crear({
    id: "nec-demo-medica",
    titulo: "Atencion medica en refugio",
    descripcion: "Se requiere apoyo medico para adultos mayores.",
    habilidad: Habilidad.Medico,
    urgencia: Urgencia.Critica,
    zona,
    contacto: contacto.value,
    tokenGestion: "token-nec-demo",
    creadoEn: new Date(Date.now() - 35 * 60 * 1000),
    caducaEn: new Date(Date.now() + 47 * 60 * 60 * 1000),
  });
  if (!necesidad.ok) throw new Error("Necesidad demo invalida");
  return necesidad.value;
}

function zonaDemo(estadoGeo: string): Zona {
  const municipio = MUNICIPIOS.find((item) => item.estadoGeo === estadoGeo) ?? MUNICIPIOS[0];
  if (municipio === undefined) throw new Error("Sin municipios demo");
  const zona = Zona.crear(municipio);
  if (!zona.ok) throw new Error("Zona demo invalida");
  return zona.value;
}

voluntarios = new DevVoluntarioRepository([crearVoluntarioDemo()]);
necesidades = new DevNecesidadRepository([crearNecesidadDemo()]);
registroLimiter = new EdgeRateLimiter(20, 60 * 60 * 1000);
necesidadLimiter = new EdgeRateLimiter(5, 10 * 60 * 1000);

const server = createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    console.error(error);
    sendText(res, 500, "Error interno");
  }
});

server.listen(PORT, () => {
  console.log(`Manos dev server: ${BASE_URL}`);
});
