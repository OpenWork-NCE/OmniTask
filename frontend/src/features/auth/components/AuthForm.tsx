import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { z } from "zod";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

import type { createLoginSchema } from "../schemas/auth-schema";

type AuthSchema = ReturnType<typeof createLoginSchema>;
type AuthValues = z.infer<AuthSchema>;

type AuthFormProps = Readonly<{
  schema: AuthSchema;
  actionLabel: string;
  pendingLabel: string;
  pending: boolean;
  serverError?: string | undefined;
  passwordHint?: string | undefined;
  onSubmit: (values: AuthValues) => Promise<void>;
}>;

export function AuthForm({
  actionLabel,
  onSubmit,
  passwordHint,
  pending,
  pendingLabel,
  schema,
  serverError
}: AuthFormProps) {
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<AuthValues>({ resolver: zodResolver(schema), mode: "onSubmit" });

  return (
    <form
      className="grid gap-5"
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      {serverError ? (
        <div
          className="rounded-xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
          role="alert"
        >
          {serverError}
        </div>
      ) : null}
      <FormField
        {...register("email")}
        autoComplete="email"
        error={errors.email?.message}
        inputMode="email"
        label={t("auth.fields.email")}
        type="email"
      />
      <FormField
        {...register("password")}
        autoComplete="current-password"
        description={passwordHint}
        error={errors.password?.message}
        label={t("auth.fields.password")}
        type={passwordVisible ? "text" : "password"}
        trailing={
          <button
            className="inline-flex size-10 items-center justify-center rounded-lg text-muted hover:bg-elevated hover:text-primary"
            type="button"
            aria-label={t(
              passwordVisible ? "auth.fields.hidePassword" : "auth.fields.showPassword"
            )}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? (
              <EyeOff aria-hidden className="size-5" />
            ) : (
              <Eye aria-hidden className="size-5" />
            )}
          </button>
        }
      />
      <Button className="mt-1 w-full" pending={pending} type="submit">
        {pending ? pendingLabel : actionLabel}
      </Button>
    </form>
  );
}
