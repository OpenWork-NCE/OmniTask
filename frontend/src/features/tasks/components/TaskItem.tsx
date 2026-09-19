import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Task } from "../api/task-types";
import { TaskStatusBadge } from "./TaskStatusBadge";

type TaskItemProps = Readonly<{
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}>;

export function TaskItem({ onDelete, onEdit, task }: TaskItemProps) {
  const { i18n, t } = useTranslation();
  const updatedAt = new Intl.DateTimeFormat(i18n.resolvedLanguage === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "medium"
  }).format(new Date(task.updatedAt));

  return (
    <article className="group grid gap-4 rounded-2xl border border-border/45 bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-lg md:grid-cols-[minmax(0,1fr)_9rem_8rem_auto] md:items-center md:px-6">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-primary [overflow-wrap:anywhere]">{task.title}</h2>
        {task.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted [overflow-wrap:anywhere]">
            {task.description}
          </p>
        ) : null}
      </div>
      <TaskStatusBadge status={task.status} />
      <time className="text-sm font-medium text-muted" dateTime={task.updatedAt}>
        {updatedAt}
      </time>
      <div className="flex items-center gap-2 md:justify-end">
        <button
          aria-label={t("tasks.actions.editNamed", { title: task.title })}
          className="grid size-11 place-items-center rounded-xl border border-border/60 text-muted transition hover:border-brand hover:bg-elevated hover:text-primary"
          onClick={() => onEdit(task)}
          type="button"
        >
          <Pencil aria-hidden className="size-4.5" strokeWidth={1.75} />
        </button>
        <button
          aria-label={t("tasks.actions.deleteNamed", { title: task.title })}
          className="grid size-11 place-items-center rounded-xl border border-border/60 text-muted transition hover:border-danger hover:bg-danger/10 hover:text-danger"
          onClick={() => onDelete(task)}
          type="button"
        >
          <Trash2 aria-hidden className="size-4.5" strokeWidth={1.75} />
        </button>
      </div>
    </article>
  );
}
