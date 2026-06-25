import { RateLimiter, type RateLimitResult } from "../../application/ports/RateLimiter";

type HitCounter = {
  readonly count: number;
  readonly resetAt: number;
};

export class EdgeRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, HitCounter>();

  constructor(
    private readonly limit: number = 20,
    private readonly windowMs: number = 60 * 60 * 1000,
    private readonly now: () => number = () => Date.now(),
  ) {}

  async consumir(ip: string): Promise<RateLimitResult> {
    const current = this.now();
    const hit = this.hits.get(ip);

    if (hit === undefined || hit.resetAt <= current) {
      this.hits.set(ip, { count: 1, resetAt: current + this.windowMs });
      return { allowed: true };
    }

    if (hit.count >= this.limit) {
      return { allowed: false };
    }

    this.hits.set(ip, { count: hit.count + 1, resetAt: hit.resetAt });
    return { allowed: true };
  }
}
