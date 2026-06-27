INSERT OR IGNORE INTO voluntario (id, nombre, telefono_e164, estado, estado_geo, lat, lng, geohash, radio_km, token_gestion, verificado, creado_en)
VALUES ('vol-demo-medico', 'Voluntaria demo', '+584121234567', 'DISPONIBLE', 'Distrito Capital/Caracas', 10.4806, -66.9036, 'd9', 20, 'token-vol-demo', 0, datetime('now'));

INSERT OR IGNORE INTO voluntario_habilidad (voluntario_id, habilidad)
VALUES ('vol-demo-medico', 'medico'), ('vol-demo-medico', 'voluntario_general');

INSERT OR IGNORE INTO necesidad (id, titulo, descripcion, habilidad, urgencia, estado, estado_geo, lat, lng, geohash, contacto_e164, token_gestion, caduca_en, creado_en)
VALUES ('nec-demo-medica', 'Atencion medica en refugio', 'Se requiere apoyo medico para adultos mayores.', 'medico', 'CRITICA', 'ABIERTA', 'Distrito Capital/Caracas', 10.4806, -66.9036, 'd9', '+584221234567', 'token-nec-demo', datetime('now', '+47 hours'), datetime('now', '-35 minutes'));
