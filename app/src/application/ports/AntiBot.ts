export type AntiBotVerification = {
  readonly success: boolean;
};

export interface AntiBot {
  verificar(token: string, ip: string): Promise<AntiBotVerification>;
}
