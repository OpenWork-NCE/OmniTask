import { Suspense, type ReactNode } from "react";
import type { RouteObject } from "react-router-dom";

import { ProtectedRoute, RouteLoading } from "@/features/auth/routing/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/routing/PublicOnlyRoute";
import {
  DeferredLoginPage,
  DeferredNotFoundPage,
  DeferredRegisterPage,
  DeferredTasksPage
} from "./LazyRoutePages";
import { RootRedirect } from "./RoutePages";

function deferred(page: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{page}</Suspense>;
}

export const appRoutes: RouteObject[] = [
  { path: "/", element: <RootRedirect /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: deferred(<DeferredLoginPage />) },
      { path: "/register", element: deferred(<DeferredRegisterPage />) }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/app/tasks", element: deferred(<DeferredTasksPage />) }]
  },
  { path: "*", element: deferred(<DeferredNotFoundPage />) }
];
