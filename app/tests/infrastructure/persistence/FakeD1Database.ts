import { type D1DatabaseLike } from "../../../src/infrastructure/persistence/D1VoluntarioRepository";

type Row = Record<string, unknown>;
type Table = Row[];

type D1Value = string | number | null;

type Condition = { readonly col: string; readonly op: string };

class FakePreparedStatement {
  private values: D1Value[] = [];

  constructor(private readonly sql: string) {}

  bind(...values: D1Value[]): FakePreparedStatement {
    this.values = values;
    return this;
  }

  async run(): Promise<{ readonly meta: { readonly changes: number } }> {
    const changes = FakeD1Database.execute(this.sql, this.values);
    return { meta: { changes } };
  }

  async first<T>(): Promise<T | null> {
    const rows = FakeD1Database.query(this.sql, this.values);
    const first: T | undefined = rows[0] as T | undefined;
    return first ?? null;
  }

  async all<T>(): Promise<{ readonly results: T[] }> {
    const rows = FakeD1Database.query(this.sql, this.values);
    return { results: rows as T[] };
  }
}

export class FakeD1Database implements D1DatabaseLike {
  private static tables: Record<string, Table> = {};

  static reset(): void {
    FakeD1Database.tables = {};
  }

  static seed(table: string, rows: Row[]): void {
    const existing = FakeD1Database.tables[table] ?? [];
    FakeD1Database.tables[table] = [...existing, ...rows];
  }

  static execute(sql: string, params: D1Value[]): number {
    const upper = sql.trim().toUpperCase();
    if (upper.startsWith("INSERT")) {
      return FakeD1Database.executeInsert(sql, params);
    }
    if (upper.startsWith("UPDATE")) {
      return FakeD1Database.executeUpdate(sql, params);
    }
    return 0;
  }

  static query(sql: string, params: D1Value[]): Row[] {
    const upper = sql.trim().toUpperCase();
    if (upper.startsWith("SELECT")) {
      return FakeD1Database.executeSelect(sql, params);
    }
    return [];
  }

  private static tableName(sql: string): string {
    const m = sql.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
    return m?.[1] ?? "";
  }

  private static executeInsert(sql: string, params: D1Value[]): number {
    const table = FakeD1Database.tableName(sql);
    const colsMatch = sql.match(/\(([^)]+)\)/);
    if (!colsMatch) return 0;
    const cols: string = colsMatch[1] as string;
    const colNames: string[] = cols.split(",").map((c) => c.trim());
    const row: Row = {};
    for (let i = 0; i < colNames.length && i < params.length; i++) {
      const colName: string | undefined = colNames[i];
      if (colName !== undefined) {
        row[colName] = params[i];
      }
    }
    if (FakeD1Database.tables[table] === undefined) {
      FakeD1Database.tables[table] = [];
    }
    const tableRef: Table | undefined = FakeD1Database.tables[table];
    if (tableRef !== undefined) {
      tableRef.push(row);
    }
    return 1;
  }

  private static executeUpdate(sql: string, params: D1Value[]): number {
    const table = FakeD1Database.tableName(sql);
    const rows: Table = FakeD1Database.tables[table] ?? [];
    const setMatch = sql.match(/SET\s+(\w+)\s*=\s*\?/i);
    const setCol: string = setMatch?.[1] ?? "";
    const setIdx: number = setMatch !== null ? 1 : -1;

    const whereClause = sql.split(/ WHERE /i)[1] ?? "";
    const conditions: Condition[] = FakeD1Database.parseWhere(whereClause);

    let changed = 0;
    for (const row of rows) {
      const whereParams: D1Value[] = setIdx < 0 ? params : params.slice(1);
      if (FakeD1Database.matches(row, conditions, whereParams)) {
        row[setCol] = params[0];
        changed++;
      }
    }
    return changed;
  }

  private static executeSelect(sql: string, params: D1Value[]): Row[] {
    const table = FakeD1Database.tableName(sql);

    const isDistinct: boolean = sql.toUpperCase().includes("SELECT DISTINCT");
    const isJoin: boolean = sql.toUpperCase().includes("INNER JOIN");
    const isCount: boolean = sql.toUpperCase().includes("COUNT(*)");

    if (isJoin) {
      return FakeD1Database.executeJoin(sql, params, table);
    }

    const rows: Table = FakeD1Database.tables[table] ?? [];
    const whereClause: string = sql.split(/ WHERE /i)[1]?.split(/ ORDER BY /i)[0] ?? "";
    const conditions: Condition[] = FakeD1Database.parseWhere(whereClause);

    let filtered: Row[] = rows.filter((row) => FakeD1Database.matches(row, conditions, params));

    if (isCount) {
      return [{ total: filtered.length }];
    }

    const orderMatch = sql.match(/ORDER BY\s+(.+)/i);
    if (orderMatch) {
      filtered = [...filtered].sort((a, b) => {
        const orderBy = orderMatch[1]!;
        const parts: string[] = FakeD1Database.splitOrderBy(orderBy);
        for (const part of parts) {
          const desc = part.toUpperCase().endsWith("DESC");
          let col: string = part.replace(/\s+(ASC|DESC)$/i, "").trim();
          let cmp = 0;
          if (col.toUpperCase().startsWith("CASE")) {
            cmp = FakeD1Database.caseCmp(col, a, b);
          } else {
            const colA = a[col] ?? "";
            const colB = b[col] ?? "";
            if (typeof colA === "number" && typeof colB === "number") {
              cmp = colA - colB;
            } else {
              cmp = String(colA).localeCompare(String(colB));
            }
          }
          if (cmp !== 0) return desc ? -cmp : cmp;
        }
        return 0;
      });
    }

    return filtered;
  }

  private static executeJoin(sql: string, params: D1Value[], mainTableName: string): Row[] {
    const mainTable: Table = FakeD1Database.tables[mainTableName] ?? [];
    const joinMatch = sql.match(/INNER JOIN\s+(\w+)/i);
    const joinTableName: string = joinMatch !== null ? (joinMatch[1] as string) : "";
    const joinTable: Table = FakeD1Database.tables[joinTableName] ?? [];

    const estadoParam: D1Value = params.length > 0 ? params[0]! : null;
    const habilidadParam: D1Value = params.length > 1 ? params[1]! : null;
    const geohashParam: D1Value = params.length > 2 ? params[2]! : null;

    const rows: Row[] = mainTable.filter((row) => {
      const joinRow: Row | undefined = joinTable.find(
        (jr) => jr["voluntario_id"] === row["id"] && jr["habilidad"] === habilidadParam,
      );
      return (
        row["estado"] === estadoParam &&
        joinRow !== undefined &&
        String(row["geohash"] ?? "").startsWith(String(geohashParam ?? ""))
      );
    });

    const isDistinct: boolean = sql.toUpperCase().includes("SELECT DISTINCT");
    return isDistinct ? FakeD1Database.uniqueRows(rows) : rows;
  }

  private static parseWhere(where: string): Condition[] {
    if (!where) return [];
    const parts: string[] = where.split(/\s+AND\s+/i);
    return parts.map((p): Condition => {
      const m = p.match(/(\w+)\s*(=|<=|>|<|>=)\s*\?/);
      if (m) return { col: m[1] as string, op: m[2] as string };
      const m2 = p.match(/substr\((\w+),\s*\d+,\s*\d+\)\s*=\s*\?/i);
      if (m2) return { col: m2[1] as string, op: "substr" };
      return { col: "", op: "" };
    });
  }

  private static matches(row: Row, conditions: Condition[], params: D1Value[]): boolean {
    let paramIdx = 0;
    for (const cond of conditions) {
      if (cond.col === "" || cond.op === "") continue;
      const param: D1Value | undefined = params[paramIdx++];
      if (param === undefined) continue;
      if (cond.op === "substr") {
        if (!String(row[cond.col] ?? "").startsWith(String(param))) return false;
      } else if (cond.op === "=") {
        if (row[cond.col] !== param) return false;
      } else if (cond.op === ">") {
        const rowVal: unknown = row[cond.col];
        const paramVal: unknown = param;
        if (typeof rowVal === "number" && typeof paramVal === "number") {
          if (!(rowVal > paramVal)) return false;
        } else {
          if (!(String(rowVal) > String(paramVal))) return false;
        }
      } else if (cond.op === "<=") {
        const rowVal: unknown = row[cond.col];
        const paramVal: unknown = param;
        if (typeof rowVal === "number" && typeof paramVal === "number") {
          if (!(rowVal <= paramVal)) return false;
        } else {
          if (!(String(rowVal) <= String(paramVal))) return false;
        }
      }
    }
    return true;
  }

  private static splitOrderBy(orderBy: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let current = "";
    for (const ch of orderBy) {
      if (ch === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
      } else {
        if (ch === "(") depth++;
        if (ch === ")") depth--;
        current += ch;
      }
    }
    if (current.trim().length > 0) {
      parts.push(current.trim());
    }
    return parts;
  }

  private static caseCmp(caseExpr: string, a: Row, b: Row): number {
    const m = caseExpr.match(/CASE\s+(\w+)\s+(WHEN\s+'[^']+'\s+THEN\s+\d+\s*)+/i);
    if (!m) return 0;
    const col = m[1] as string;
    const whens = caseExpr.match(/WHEN\s+'([^']+)'\s+THEN\s+(\d+)/gi);
    if (!whens) return 0;
    const map: Record<string, number> = {};
    for (const w of whens) {
      const wm = w.match(/WHEN\s+'([^']+)'\s+THEN\s+(\d+)/i);
      if (wm) {
        map[wm[1]!] = Number(wm[2]);
      }
    }
    const valA = map[String(a[col] ?? "")] ?? 99;
    const valB = map[String(b[col] ?? "")] ?? 99;
    return valA - valB;
  }

  private static uniqueRows(rows: Row[]): Row[] {
    const seen = new Set<string>();
    return rows.filter((r) => {
      const key: string = String(r["id"] ?? "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  prepare(sql: string): FakePreparedStatement {
    return new FakePreparedStatement(sql);
  }

  async batch(statements: readonly FakePreparedStatement[]): Promise<unknown> {
    for (const stmt of statements) {
      await stmt.run();
    }
    return undefined;
  }
}
