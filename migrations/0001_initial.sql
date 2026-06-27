CREATE TABLE voluntario (
  id TEXT PRIMARY KEY, nombre TEXT NOT NULL, telefono_e164 TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'DISPONIBLE',
  estado_geo TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL,
  geohash TEXT NOT NULL, radio_km INTEGER NOT NULL DEFAULT 15,
  token_gestion TEXT NOT NULL UNIQUE, verificado INTEGER NOT NULL DEFAULT 0,
  creado_en TEXT NOT NULL
);

CREATE TABLE voluntario_habilidad (
  voluntario_id TEXT NOT NULL REFERENCES voluntario(id) ON DELETE CASCADE,
  habilidad TEXT NOT NULL, PRIMARY KEY (voluntario_id, habilidad)
);

CREATE TABLE necesidad (
  id TEXT PRIMARY KEY, titulo TEXT NOT NULL, descripcion TEXT NOT NULL,
  habilidad TEXT NOT NULL, urgencia TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'ABIERTA',
  estado_geo TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL, geohash TEXT NOT NULL,
  contacto_e164 TEXT NOT NULL, token_gestion TEXT NOT NULL UNIQUE,
  caduca_en TEXT NOT NULL, creado_en TEXT NOT NULL
);

CREATE TABLE match (
  id TEXT PRIMARY KEY, necesidad_id TEXT NOT NULL REFERENCES necesidad(id),
  voluntario_id TEXT NOT NULL REFERENCES voluntario(id),
  estado TEXT NOT NULL DEFAULT 'PROPUESTO',
  creado_en TEXT NOT NULL
);

CREATE INDEX idx_vol_match  ON voluntario(estado, geohash);
CREATE INDEX idx_nec_listar ON necesidad(estado, urgencia, creado_en);
