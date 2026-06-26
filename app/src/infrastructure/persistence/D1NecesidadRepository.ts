import { type NecesidadRepository } from "../../application/ports/NecesidadRepository";
import { EstadoNecesidad, Necesidad } from "../../domain/entities/Necesidad";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { TelefonoVE } from "../../domain/value-objects/TelefonoVE";
import { Urgencia } from "../../domain/value-objects/Urgencia";
import { Zona } from "../../domain/value-objects/Zona";
import { type D1DatabaseLike } from "./D1VoluntarioRepository";

type NecesidadRow = {
  readonly id: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly habilidad: Habilidad;
  readonly urgencia: Urgencia;
  readonly estado: EstadoNecesidad;
  readonly estado_geo: string;
  readonly lat: number;
  readonly lng: number;
  readonly contacto_e164: string;
  readonly token_gestion: string;
  readonly caduca_en: string;
  readonly creado_en: string;
};

export class D1NecesidadRepository implements NecesidadRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async guardar(necesidad: Necesidad): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO necesidad (id, titulo, descripcion, habilidad, urgencia, estado, estado_geo, lat, lng, geohash, contacto_e164, token_gestion, caduca_en, creado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        necesidad.id,
        necesidad.titulo,
        necesidad.descripcion,
        necesidad.habilidad,
        necesidad.urgencia,
        necesidad.estado,
        necesidad.zona.estadoGeo,
        necesidad.zona.lat,
        necesidad.zona.lng,
        necesidad.zona.geohash,
        necesidad.contacto.value,
        necesidad.tokenGestion,
        necesidad.caducaEn.toISOString(),
        necesidad.creadoEn.toISOString(),
      )
      .run();
  }

  async buscarPorId(id: string): Promise<Necesidad | null> {
    const row = await this.db.prepare("SELECT * FROM necesidad WHERE id = ?").bind(id).first<NecesidadRow>();

    return row === null ? null : this.hidratar(row);
  }

  async buscarPorTokenGestion(tokenGestion: string): Promise<Necesidad | null> {
    const row = await this.db
      .prepare("SELECT * FROM necesidad WHERE token_gestion = ?")
      .bind(tokenGestion)
      .first<NecesidadRow>();

    return row === null ? null : this.hidratar(row);
  }

  async contarActivasPorContacto(contacto: TelefonoVE, now: Date): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) AS total FROM necesidad WHERE contacto_e164 = ? AND estado = ? AND caduca_en > ?")
      .bind(contacto.value, EstadoNecesidad.Abierta, now.toISOString())
      .first<{ readonly total: number }>();

    return row?.total ?? 0;
  }

  async cambiarEstado(id: string, estado: EstadoNecesidad): Promise<void> {
    await this.db.prepare("UPDATE necesidad SET estado = ? WHERE id = ?").bind(estado, id).run();
  }

  async expirarVencidas(now: Date): Promise<number> {
    await this.db
      .prepare("UPDATE necesidad SET estado = ? WHERE estado = ? AND caduca_en <= ?")
      .bind(EstadoNecesidad.Expirada, EstadoNecesidad.Abierta, now.toISOString())
      .run();
    return 0;
  }

  async listarAbiertasVigentes(now: Date): Promise<Necesidad[]> {
    return this.listarPorEstado(EstadoNecesidad.Abierta, now);
  }

  async listarPorEstado(estado: EstadoNecesidad, now: Date): Promise<Necesidad[]> {
    if (estado === EstadoNecesidad.Abierta) {
      const rows = await this.db
        .prepare("SELECT * FROM necesidad WHERE estado = ? AND caduca_en > ? ORDER BY urgencia ASC, creado_en DESC")
        .bind(estado, now.toISOString())
        .all<NecesidadRow>();

      return rows.results.map((row) => this.hidratar(row));
    }

    const rows = await this.db
      .prepare("SELECT * FROM necesidad WHERE estado = ? ORDER BY urgencia ASC, creado_en DESC")
      .bind(estado)
      .all<NecesidadRow>();

    return rows.results.map((row) => this.hidratar(row));
  }

  private hidratar(row: NecesidadRow): Necesidad {
    const contacto = TelefonoVE.crear(row.contacto_e164);
    const zona = Zona.crear({ estadoGeo: row.estado_geo, lat: row.lat, lng: row.lng });
    if (!contacto.ok || !zona.ok) {
      throw new Error("Necesidad persistida invalida");
    }

    const necesidad = Necesidad.crear({
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      habilidad: row.habilidad,
      urgencia: row.urgencia,
      estado: row.estado,
      zona: zona.value,
      contacto: contacto.value,
      tokenGestion: row.token_gestion,
      caducaEn: new Date(row.caduca_en),
      creadoEn: new Date(row.creado_en),
    });

    if (!necesidad.ok) {
      throw new Error("Necesidad persistida invalida");
    }

    return necesidad.value;
  }
}
