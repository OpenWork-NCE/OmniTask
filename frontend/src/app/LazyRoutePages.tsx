import { lazy } from "react";

export const DeferredLoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);

export const DeferredRegisterPage = lazy(() =>
  import("@/features/auth/pages/RegisterPage").then((module) => ({ default: module.RegisterPage }))
);

export const DeferredNotFoundPage = lazy(() =>
  import("./NotFoundPage").then((module) => ({ default: module.NotFoundPage }))
);

export const DeferredTasksPage = lazy(() =>
  import("@/features/tasks/pages/TasksPage").then((module) => ({ default: module.TasksPage }))
);
