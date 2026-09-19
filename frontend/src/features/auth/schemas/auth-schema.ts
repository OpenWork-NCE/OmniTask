import type { TFunction } from "i18next";
import { z } from "zod";

function emailSchema(t: TFunction) {
  return z
    .string()
    .min(1, t("auth.validation.emailRequired"))
    .max(254, t("auth.validation.emailTooLong"))
    .refine((value) => z.email().safeParse(value).success, t("auth.validation.emailInvalid"));
}

function passwordSchema(t: TFunction, requireMinimum: boolean) {
  let schema = z
    .string()
    .min(1, t("auth.validation.passwordRequired"))
    .max(128, t("auth.validation.passwordTooLong"));
  if (requireMinimum) schema = schema.min(12, t("auth.validation.passwordTooShort"));
  return schema;
}

export function createLoginSchema(t: TFunction) {
  return z.object({ email: emailSchema(t), password: passwordSchema(t, false) });
}

export function createRegisterSchema(t: TFunction) {
  return z.object({ email: emailSchema(t), password: passwordSchema(t, true) });
}

export type AuthFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
