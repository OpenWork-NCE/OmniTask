import { z } from "zod";

export const SESSION_KEY = "omnitask.session";

export type Session = Readonly<{
  accessToken: string;
  expiresAt: number;
}>;

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.number().positive()
});

const tokenPayloadSchema = z.object({
  exp: z.number().int().positive()
});

export function readSession(now = Date.now()): Session | null {
  const storedSession = sessionStorage.getItem(SESSION_KEY);
  if (!storedSession) return null;

  try {
    const parsed = sessionSchema.safeParse(JSON.parse(storedSession));
    if (!parsed.success || parsed.data.expiresAt <= now) {
      clearSession();
      return null;
    }
    return parsed.data;
  } catch {
    clearSession();
    return null;
  }
}

export function writeSession(session: Session): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionSchema.parse(session)));
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function sessionFromAccessToken(accessToken: string): Session | null {
  const encodedPayload = accessToken.split(".")[1];
  if (!encodedPayload) return null;

  try {
    const base64 = encodedPayload.replaceAll("-", "+").replaceAll("_", "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = tokenPayloadSchema.safeParse(JSON.parse(atob(base64 + padding)));
    if (!payload.success) return null;
    return { accessToken, expiresAt: payload.data.exp * 1_000 };
  } catch {
    return null;
  }
}
