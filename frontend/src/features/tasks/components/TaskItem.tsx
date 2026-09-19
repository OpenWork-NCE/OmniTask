import { useTranslation } from "react-i18next";

import type { Task } from "../api/task-types";
import { TaskStatusBadge } from "./TaskStatusBadge";

export function TaskItem({ task }: Readonly<{ task: Task }>) {
  const { i18n } = useTranslation();
  const updatedAt = new Intl.DateTimeFormat(i18n.resolvedLanguage === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "medium"
  }).format(new Date(task.updatedAt));

  return (
    <article className="group grid gap-4 rounded-2xl border border-border/45 bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-lg md:grid-cols-[minmax(0,1fr)_9rem_8rem] md:items-center md:px-6">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-bold text-primary">{task.title}</h2>
        {task.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{task.description}</p>
        ) : null}
      </div>
      <TaskStatusBadge status={task.status} />
      <time className="text-sm font-medium text-muted" dateTime={task.updatedAt}>
        {updatedAt}
      </time>
    </article>
  );
}
