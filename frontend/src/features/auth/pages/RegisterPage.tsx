import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { isApiProblem } from "@/lib/api/problem";

import { AuthForm } from "../components/AuthForm";
import { createRegisterSchema, type AuthFormValues } from "../schemas/auth-schema";
import { useSession } from "../session/session-context";

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useSession();
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const schema = useMemo(() => createRegisterSchema(t), [t]);

  async function submit(values: AuthFormValues) {
    setPending(true);
    setServerError(undefined);
    try {
      await register(values);
      void navigate("/login", { replace: true, state: { registrationComplete: true } });
    } catch (error) {
      setServerError(
        isApiProblem(error) && error.code === "EMAIL_ALREADY_REGISTERED"
          ? t("errors.duplicateEmail")
          : t("errors.generic")
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      description={t("auth.register.description")}
      eyebrow={t("auth.register.eyebrow")}
      title={t("auth.register.title")}
      variant="register"
    >
      <div className="grid gap-5">
        <AuthForm
          actionLabel={t("auth.register.action")}
          onSubmit={submit}
          passwordHint={t("auth.fields.passwordHint")}
          pending={pending}
          pendingLabel={t("auth.register.pending")}
          schema={schema}
          serverError={serverError}
        />
        <p className="text-center text-sm text-muted">
          {t("auth.register.hasAccount")}{" "}
          <Link className="font-bold text-brand underline-offset-4 hover:underline" to="/login">
            {t("auth.register.loginLink")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
