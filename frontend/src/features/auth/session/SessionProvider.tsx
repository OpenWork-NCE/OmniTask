import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useQueryClient } from "@tanstack/react-query";

import * as authApi from "../api/auth-api";
import type { AuthCredentials } from "../api/auth-api";
import { SessionContext, type SessionStatus } from "./session-context";
import {
  SESSION_EXPIRED_EVENT,
  clearSession,
  readSession,
  sessionFromAccessToken,
  writeSession
} from "./session";

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>("restoring");
  const [expiryNotice, setExpiryNotice] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setStatus(readSession() ? "authenticated" : "anonymous");
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleExpiry = () => {
      setStatus("anonymous");
      setExpiryNotice(true);
      queryClient.clear();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiry);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiry);
  }, [queryClient]);

  const value = useMemo(
    () => ({
      status,
      expiryNotice,
      login: async (credentials: AuthCredentials) => {
        const response = await authApi.login(credentials);
        const session = sessionFromAccessToken(response.accessToken);
        if (!session) throw new Error("The API returned an invalid access token");
        writeSession(session);
        setExpiryNotice(false);
        setStatus("authenticated");
      },
      register: async (credentials: AuthCredentials) => {
        await authApi.register(credentials);
      },
      logout: () => {
        clearSession();
        queryClient.clear();
        setExpiryNotice(false);
        setStatus("anonymous");
      },
      dismissExpiryNotice: () => setExpiryNotice(false)
    }),
    [expiryNotice, queryClient, status]
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}
