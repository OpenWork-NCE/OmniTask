import { Navigate } from "react-router-dom";

import { useSession } from "@/features/auth/session/session-context";

export function RootRedirect() {
  const { status } = useSession();
  if (status === "restoring") return null;
  return <Navigate replace to={status === "authenticated" ? "/app/tasks" : "/login"} />;
}
