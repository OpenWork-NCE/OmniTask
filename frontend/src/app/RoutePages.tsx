import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { useSession } from "@/features/auth/session/session-context";

export function RootRedirect() {
  const { status } = useSession();
  if (status === "restoring") return null;
  return <Navigate replace to={status === "authenticated" ? "/app/tasks" : "/login"} />;
}

export function TaskWorkspacePlaceholder() {
  const { t } = useTranslation();
  return (
    <main className="min-h-dvh bg-canvas px-5 py-12 text-primary">
      <div className="mx-auto max-w-7xl">
        <p className="font-bold tracking-widest text-brand uppercase">{t("tasks.eyebrow")}</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold">{t("navigation.tasks")}</h1>
      </div>
    </main>
  );
}
