import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { isApiProblem } from "@/lib/api/problem";

import { AuthForm } from "../components/AuthForm";
import { safeLocalDestination } from "../routing/destination";
import { createLoginSchema, type AuthFormValues } from "../schemas/auth-schema";
import { useSession } from "../session/session-context";

type LoginLocationState = Readonly<{
  from?: unknown;
  registrationComplete?: boolean;
}>;

export function LoginPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { expiryNotice, login } = useSession();
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const schema = useMemo(() => createLoginSchema(t), [t]);
  const state = (location.state ?? {}) as LoginLocationState;

  async function submit(values: AuthFormValues) {
    setPending(true);
    setServerError(undefined);
    try {
      await login(values);
      void navigate(safeLocalDestination(state.from), { replace: true });
    } catch (error) {
      setServerError(
        isApiProblem(error) && error.code === "INVALID_CREDENTIALS"
          ? t("errors.invalidCredentials")
          : t("errors.generic")
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      description={t("auth.login.description")}
      eyebrow={t("auth.login.eyebrow")}
      title={t("auth.login.title")}
      variant="login"
    >
      <div className="grid gap-5">
        {state.registrationComplete ? (
          <p className="notice-success" role="status">
            {t("auth.notices.accountCreated")}
          </p>
        ) : null}
        {expiryNotice ? (
          <p className="notice-warning" role="alert">
            {t("errors.sessionExpired")}
          </p>
        ) : null}
        <AuthForm
          actionLabel={t("auth.login.action")}
          onSubmit={submit}
          pending={pending}
          pendingLabel={t("auth.login.pending")}
          schema={schema}
          serverError={serverError}
        />
        <p className="text-center text-sm text-muted">
          {t("auth.login.noAccount")}{" "}
          <Link className="font-bold text-brand underline-offset-4 hover:underline" to="/register">
            {t("auth.login.registerLink")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
