import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

import type { Task } from "../api/task-types";
import { createTaskInputSchema, type TaskFormValues } from "../schemas/task-schema";

type TaskEditorDialogProps = Readonly<{
  task: Task | null;
  open: boolean;
  pending: boolean;
  error: string | null;
  conflict: boolean;
  onClose: () => void;
  onReload: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}>;

export function TaskEditorDialog({
  conflict,
  error,
  onClose,
  onReload,
  onSubmit,
  open,
  pending,
  task
}: TaskEditorDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createTaskInputSchema(t), [t]);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "TODO"
    }
  });

  const title = task ? t("dialogs.editTitle") : t("dialogs.createTitle");

  return (
    <Dialog open={open} onClose={pending ? () => undefined : onClose}>
      <DialogBackdrop className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition data-closed:opacity-0" />
      <div className="fixed inset-0 z-50 grid place-items-end overflow-y-auto p-3 sm:place-items-center sm:p-6">
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <DialogPanel className="max-h-[calc(100dvh-1.5rem)] w-full overflow-y-auto rounded-3xl border border-border/50 bg-surface p-6 text-primary shadow-2xl transition duration-200 data-closed:translate-y-4 data-closed:opacity-0 sm:max-h-[calc(100dvh-3rem)] sm:p-8">
            <DialogTitle className="font-display text-2xl font-extrabold">{title}</DialogTitle>
            <form
              className="mt-7 grid gap-5"
              noValidate
              onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            >
              {error ? (
                <div
                  className="grid gap-3 rounded-xl border border-danger/35 bg-danger/10 p-4"
                  role="alert"
                >
                  <p className="font-semibold text-danger">{error}</p>
                  {conflict ? (
                    <Button
                      className="justify-self-start"
                      onClick={onReload}
                      type="button"
                      variant="secondary"
                    >
                      {t("tasks.actions.reload")}
                    </Button>
                  ) : null}
                </div>
              ) : null}
              <FormField
                {...register("title")}
                autoFocus
                error={errors.title?.message}
                label={t("tasks.fields.title")}
                maxLength={200}
              />
              <div className="grid gap-2">
                <label className="font-semibold text-primary" htmlFor="task-description">
                  {t("tasks.fields.description")}
                </label>
                <textarea
                  {...register("description")}
                  aria-describedby={errors.description ? "task-description-error" : undefined}
                  aria-invalid={Boolean(errors.description)}
                  className={`min-h-32 resize-y rounded-xl border bg-surface px-4 py-3 text-primary shadow-sm ${errors.description ? "border-danger" : "border-border"}`}
                  id="task-description"
                  maxLength={5_000}
                />
                {errors.description ? (
                  <p className="text-sm font-semibold text-danger" id="task-description-error">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <label className="font-semibold text-primary" htmlFor="task-status">
                  {t("tasks.fields.status")}
                </label>
                <select
                  {...register("status")}
                  className="min-h-12 rounded-xl border border-border bg-surface px-4 text-primary shadow-sm"
                  id="task-status"
                >
                  <option value="TODO">{t("status.todo")}</option>
                  <option value="IN_PROGRESS">{t("status.inProgress")}</option>
                  <option value="DONE">{t("status.done")}</option>
                </select>
              </div>
              <div className="grid gap-3 pt-2 sm:grid-cols-2 sm:[&>*:first-child]:order-1 sm:[&>*:last-child]:order-2">
                <Button disabled={pending} onClick={onClose} type="button" variant="secondary">
                  {t("tasks.actions.cancel")}
                </Button>
                <Button pending={pending} type="submit">
                  {task ? t("tasks.actions.save") : t("tasks.actions.saveTask")}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </motion.div>
      </div>
    </Dialog>
  );
}
