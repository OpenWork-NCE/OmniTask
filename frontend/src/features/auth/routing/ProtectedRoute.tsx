import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSession } from "../session/session-context";

export function ProtectedRoute() {
  const location = useLocation();
  const { status } = useSession();

  if (status === "restoring") return <RouteLoading />;
  if (status === "anonymous") {
    return (
      <Navigate
        replace
        to="/login"
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }
  return <Outlet />;
}

export function RouteLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas" aria-busy="true">
      <span className="size-10 animate-pulse rounded-full bg-brand/30" />
    </main>
  );
}
