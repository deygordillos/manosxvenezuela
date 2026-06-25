export function crearId(prefix: string, random: () => string): string {
  return `${prefix}_${random().slice(0, 16)}`;
}

export function crearTokenGestion(randomBytes: (length: number) => Uint8Array): string {
  const bytes = randomBytes(16);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
