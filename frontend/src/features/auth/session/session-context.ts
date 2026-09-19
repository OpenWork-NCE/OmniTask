import { createContext, useContext } from "react";

import type { AuthCredentials } from "../api/auth-api";

export type SessionStatus = "restoring" | "anonymous" | "authenticated";

export type SessionContextValue = Readonly<{
  status: SessionStatus;
  expiryNotice: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
  dismissExpiryNotice: () => void;
}>;

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used within SessionProvider");
  return session;
}
