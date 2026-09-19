import type { TFunction } from "i18next";
import { z } from "zod";

export function createTaskInputSchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t("tasks.validation.titleRequired"))
      .max(200, t("tasks.validation.titleTooLong")),
    description: z.string().max(5_000, t("tasks.validation.descriptionTooLong")),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"])
  });
}

export type TaskFormValues = z.infer<ReturnType<typeof createTaskInputSchema>>;
