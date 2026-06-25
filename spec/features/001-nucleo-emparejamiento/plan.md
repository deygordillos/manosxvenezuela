# 001 · Núcleo de emparejamiento — plan.md

> **Cómo se implementa.** Solo capas `domain` y `application`. Sin frameworks.

---

## Archivos a crear
```
src/domain/value-objects/TelefonoVE.ts      # valida +58..., factory que devuelve Result
src/domain/value-objects/Habilidad.ts        # enum + parse
src/domain/value-objects/Urgencia.ts         # CRITICA|ALTA|MEDIA + peso para orden
src/domain/value-objects/Geohash.ts          # encode(lat,lng) + distanciaKm(haversine)
src/domain/value-objects/Zona.ts             # estado_geo + lat/lng + geohash
src/domain/entities/Voluntario.ts
src/domain/entities/Necesidad.ts
src/domain/entities/Match.ts
src/domain/errors/DomainError.ts
src/application/ports/VoluntarioRepository.ts
src/application/use-cases/EmparejarVoluntarios.ts
src/shared/Result.ts                         # Result<T,E> sin excepciones para flujo normal
tests/domain/*.test.ts
tests/use-cases/EmparejarVoluntarios.test.ts
```

## Decisiones de diseño
- **`Result<T, DomainError>`**: las factories (`TelefonoVE.crear`, `Voluntario.crear`) devuelven `Result`; no lanzan excepciones para validación esperada.
- **Distancia**: `Geohash.distanciaKm(a, b)` con fórmula de haversine sobre lat/lng. El geohash sirve para prefiltrar en SQL más adelante (features 002/003); aquí basta haversine.
- **Orden**: comparador `(a,b) => distancia(a) - distancia(b)` con desempate por `pesoUrgencia` y `creado_en`.
- **Repo en memoria**: `InMemoryVoluntarioRepository` vive en `tests/` (no en `src`), implementa el port `VoluntarioRepository` para probar el caso de uso aislado.

## Pseudocódigo del caso de uso
```ts
class EmparejarVoluntarios {
  constructor(private repo: VoluntarioRepository) {}
  async ejecutar(n: Necesidad): Promise<Result<Voluntario[], DomainError>> {
    const candidatos = await this.repo.buscarCompatibles({
      habilidad: n.habilidad, estado: 'DISPONIBLE', centro: n.zona,
    });
    const dentroDeRadio = candidatos.filter(v =>
      Geohash.distanciaKm(v.zona, n.zona) <= v.radioKm);
    const ordenados = dentroDeRadio.sort(porDistanciaLuegoUrgencia(n.zona));
    return Result.ok(ordenados);
  }
}
```

## Pruebas (mapean 1:1 con los CA del spec)
- `CA-1..CA-5` → `EmparejarVoluntarios.test.ts` con `InMemoryVoluntarioRepository`.
- `CA-6` → `TelefonoVE.test.ts` (validación de formato VE).
- Cobertura objetivo del dominio: 100% de ramas en value-objects.

## Sin dependencias externas
Todo es TypeScript puro. No instalar librerías de geo; haversine son ~10 líneas.
