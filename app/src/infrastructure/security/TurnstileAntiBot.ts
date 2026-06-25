import { AntiBot, type AntiBotVerification } from "../../application/ports/AntiBot";

type TurnstileResponse = {
  readonly success?: unknown;
};

export class TurnstileAntiBot implements AntiBot {
  constructor(
    private readonly secret: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async verificar(token: string, ip: string): Promise<AntiBotVerification> {
    const body = new URLSearchParams({
      secret: this.secret,
      response: token,
      remoteip: ip,
    });

    const response = await this.fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const payload = (await response.json()) as TurnstileResponse;

    return { success: payload.success === true };
  }
}
