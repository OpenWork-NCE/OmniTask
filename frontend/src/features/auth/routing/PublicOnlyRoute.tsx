import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSession } from "../session/session-context";
import { safeLocalDestination } from "./destination";
import { RouteLoading } from "./ProtectedRoute";

export function PublicOnlyRoute() {
  const location = useLocation();
  const { status } = useSession();
  if (status === "restoring") return <RouteLoading />;
  const state = (location.state ?? {}) as { from?: unknown };
  return status === "authenticated" ? (
    <Navigate replace to={safeLocalDestination(state.from)} />
  ) : (
    <Outlet />
  );
}
