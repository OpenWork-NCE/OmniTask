import { useTranslation } from "react-i18next";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import type { Task } from "../api/task-types";

type DeleteTaskDialogProps = Readonly<{
  task: Task | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}>;

export function DeleteTaskDialog({ onCancel, onConfirm, pending, task }: DeleteTaskDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      cancelLabel={t("tasks.actions.cancel")}
      confirmLabel={t("dialogs.confirmDelete")}
      description={t("dialogs.deleteDescription", { title: task?.title ?? "" })}
      onCancel={onCancel}
      onConfirm={onConfirm}
      open={task !== null}
      pending={pending}
      title={t("dialogs.deleteTitle")}
    />
  );
}
