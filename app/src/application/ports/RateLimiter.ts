export type RateLimitResult = {
  readonly allowed: boolean;
};

export interface RateLimiter {
  consumir(ip: string): Promise<RateLimitResult>;
}
