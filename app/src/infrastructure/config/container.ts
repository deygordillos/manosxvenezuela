import { type NecesidadRepository } from "../../application/ports/NecesidadRepository";
import { type VoluntarioRepository } from "../../application/ports/VoluntarioRepository";
import { D1NecesidadRepository } from "../persistence/D1NecesidadRepository";
import { D1VoluntarioRepository } from "../persistence/D1VoluntarioRepository";
import { EdgeRateLimiter } from "../security/EdgeRateLimiter";
import { TurnstileAntiBot } from "../security/TurnstileAntiBot";
import { WhatsappLinkNotifier } from "../notifications/WhatsappLinkNotifier";
import { type Env } from "./env";

export type Container = {
  readonly voluntarioRepository: VoluntarioRepository;
  readonly necesidadRepository: NecesidadRepository;
  readonly notificador: WhatsappLinkNotifier;
  readonly antiBot: TurnstileAntiBot;
  readonly registroLimiter: EdgeRateLimiter;
  readonly necesidadLimiter: EdgeRateLimiter;
};

export function createContainer(env: Env): Container {
  const db = env.DB;
  if (db === undefined) {
    throw new Error("D1 binding DB is required in production container");
  }

  return {
    voluntarioRepository: new D1VoluntarioRepository(db),
    necesidadRepository: new D1NecesidadRepository(db),
    notificador: new WhatsappLinkNotifier(),
    antiBot: new TurnstileAntiBot(env.TURNSTILE_SECRET ?? ""),
    registroLimiter: new EdgeRateLimiter(20, 60 * 60 * 1000),
    necesidadLimiter: new EdgeRateLimiter(5, 10 * 60 * 1000),
  };
}
