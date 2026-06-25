import { Zona } from "../domain/value-objects/Zona";

export type Municipio = {
  readonly estadoGeo: string;
  readonly lat: number;
  readonly lng: number;
};

export const MUNICIPIOS: readonly Municipio[] = [
  { estadoGeo: "Distrito Capital/Caracas", lat: 10.499, lng: -66.93 },
  { estadoGeo: "Carabobo/Valencia", lat: 10.162, lng: -68.008 },
  { estadoGeo: "Yaracuy/San Felipe", lat: 10.339, lng: -68.742 },
  { estadoGeo: "Aragua/Maracay", lat: 10.247, lng: -67.596 },
  { estadoGeo: "Miranda/Los Teques", lat: 10.344, lng: -67.043 },
  { estadoGeo: "La Guaira/La Guaira", lat: 10.603, lng: -66.934 },
];

export function buscarZonaPorEstadoGeo(estadoGeo: string): Zona | null {
  const municipio = MUNICIPIOS.find((item) => item.estadoGeo === estadoGeo);
  if (municipio === undefined) {
    return null;
  }

  const zona = Zona.crear(municipio);
  return zona.ok ? zona.value : null;
}
