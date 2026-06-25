import {
  type CriterioMatch,
  type VoluntarioRepository,
} from "../../application/ports/VoluntarioRepository";
import { EstadoVoluntario, Voluntario } from "../../domain/entities/Voluntario";
import { Habilidad } from "../../domain/value-objects/Habilidad";
import { TelefonoVE } from "../../domain/value-objects/TelefonoVE";
import { Zona } from "../../domain/value-objects/Zona";

type D1Value = string | number | null;

type D1PreparedStatement = {
  bind(...values: D1Value[]): D1PreparedStatement;
  run(): Promise<unknown>;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ readonly results: T[] }>;
};

export type D1DatabaseLike = {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: readonly D1PreparedStatement[]): Promise<unknown>;
};

type VoluntarioRow = {
  readonly id: string;
  readonly nombre: string;
  readonly telefono_e164: string;
  readonly estado: EstadoVoluntario;
  readonly estado_geo: string;
  readonly lat: number;
  readonly lng: number;
  readonly radio_km: number;
  readonly token_gestion: string;
  readonly creado_en: string;
};

type HabilidadRow = {
  readonly habilidad: Habilidad;
};

export class D1VoluntarioRepository implements VoluntarioRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async guardar(voluntario: Voluntario): Promise<void> {
    const statements = [
      this.db
        .prepare(
          `INSERT INTO voluntario (id, nombre, telefono_e164, estado, estado_geo, lat, lng, geohash, radio_km, token_gestion, verificado, creado_en)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          voluntario.id,
          voluntario.nombre,
          voluntario.telefono.value,
          voluntario.estado,
          voluntario.zona.estadoGeo,
          voluntario.zona.lat,
          voluntario.zona.lng,
          voluntario.zona.geohash,
          voluntario.radioKm,
          voluntario.tokenGestion,
          0,
          voluntario.creadoEn.toISOString(),
        ),
      ...[...voluntario.habilidades].map((habilidad) =>
        this.db
          .prepare("INSERT INTO voluntario_habilidad (voluntario_id, habilidad) VALUES (?, ?)")
          .bind(voluntario.id, habilidad),
      ),
    ];

    await this.db.batch(statements);
  }

  async buscarPorTokenGestion(tokenGestion: string): Promise<Voluntario | null> {
    const row = await this.db
      .prepare("SELECT * FROM voluntario WHERE token_gestion = ?")
      .bind(tokenGestion)
      .first<VoluntarioRow>();

    return row === null ? null : this.hidratar(row);
  }

  async buscarCompatibles(criterio: CriterioMatch): Promise<Voluntario[]> {
    const rows = await this.db
      .prepare(
        `SELECT DISTINCT v.* FROM voluntario v
         INNER JOIN voluntario_habilidad vh ON vh.voluntario_id = v.id
         WHERE v.estado = ? AND vh.habilidad = ? AND substr(v.geohash, 1, 3) = ?`,
      )
      .bind(criterio.estado, criterio.habilidad, criterio.centro.geohash.slice(0, 3))
      .all<VoluntarioRow>();

    return Promise.all(rows.results.map((row) => this.hidratar(row)));
  }

  async cambiarEstado(id: string, estado: EstadoVoluntario): Promise<void> {
    await this.db.prepare("UPDATE voluntario SET estado = ? WHERE id = ?").bind(estado, id).run();
  }

  private async hidratar(row: VoluntarioRow): Promise<Voluntario> {
    const telefono = TelefonoVE.crear(row.telefono_e164);
    const zona = Zona.crear({ estadoGeo: row.estado_geo, lat: row.lat, lng: row.lng });
    const habilidades = await this.db
      .prepare("SELECT habilidad FROM voluntario_habilidad WHERE voluntario_id = ?")
      .bind(row.id)
      .all<HabilidadRow>();

    if (!telefono.ok || !zona.ok) {
      throw new Error("Voluntario persistido invalido");
    }

    const voluntario = Voluntario.crear({
      id: row.id,
      nombre: row.nombre,
      telefono: telefono.value,
      habilidades: habilidades.results.map((item) => item.habilidad),
      estado: row.estado,
      zona: zona.value,
      radioKm: row.radio_km,
      tokenGestion: row.token_gestion,
      creadoEn: new Date(row.creado_en),
    });

    if (!voluntario.ok) {
      throw new Error("Voluntario persistido invalido");
    }

    return voluntario.value;
  }
}
