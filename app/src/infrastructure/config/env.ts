import { type D1DatabaseLike } from "../persistence/D1VoluntarioRepository";

export type Env = {
  readonly DB?: D1DatabaseLike;
  readonly ENVIRONMENT: "development" | "production";
  readonly TURNSTILE_SECRET?: string;
};

export function getEnv(env: Record<string, unknown>): Env {
  return {
    DB: env.DB as D1DatabaseLike | undefined,
    ENVIRONMENT: (env.ENVIRONMENT as Env["ENVIRONMENT"]) ?? "development",
    TURNSTILE_SECRET: env.TURNSTILE_SECRET as string | undefined,
  };
}
