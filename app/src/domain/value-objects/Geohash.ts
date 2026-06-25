export type Coordenadas = {
  readonly lat: number;
  readonly lng: number;
};

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
const RADIO_TIERRA_KM = 6371;

export class Geohash {
  static encode(lat: number, lng: number, precision = 7): string {
    let latRange: [number, number] = [-90, 90];
    let lngRange: [number, number] = [-180, 180];
    let bits = 0;
    let bit = 0;
    let hash = "";
    let procesaLng = true;

    while (hash.length < precision) {
      const range = procesaLng ? lngRange : latRange;
      const value = procesaLng ? lng : lat;
      const mid = (range[0] + range[1]) / 2;

      if (value >= mid) {
        bits = (bits << 1) + 1;
        range[0] = mid;
      } else {
        bits <<= 1;
        range[1] = mid;
      }

      procesaLng = !procesaLng;
      bit += 1;

      if (bit === 5) {
        const char = BASE32[bits];
        if (char === undefined) {
          throw new Error("Indice de geohash fuera de rango");
        }
        hash += char;
        bits = 0;
        bit = 0;
      }
    }

    return hash;
  }

  static distanciaKm(a: Coordenadas, b: Coordenadas): number {
    const dLat = gradosARadianes(b.lat - a.lat);
    const dLng = gradosARadianes(b.lng - a.lng);
    const latA = gradosARadianes(a.lat);
    const latB = gradosARadianes(b.lat);

    const h =
      Math.sin(dLat / 2) ** 2 + Math.cos(latA) * Math.cos(latB) * Math.sin(dLng / 2) ** 2;

    return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h));
  }
}

function gradosARadianes(value: number): number {
  return (value * Math.PI) / 180;
}
