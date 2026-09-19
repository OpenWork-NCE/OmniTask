import { motion } from "framer-motion";
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
    <motion.article
      className="group grid gap-4 rounded-2xl border border-border/45 bg-surface p-5 shadow-sm transition-colors duration-200 hover:border-brand/45 md:grid-cols-[minmax(0,1fr)_9rem_8rem_auto] md:items-center md:px-6"
      layout
      transition={{ layout: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.99 },
        visible: { opacity: 1, y: 0, scale: 1 }
      }}
      whileHover={{ y: -2, boxShadow: "0 16px 38px rgb(11 13 18 / 0.1)" }}
    >
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
        <motion.button
          aria-label={t("tasks.actions.editNamed", { title: task.title })}
          className="grid size-11 place-items-center rounded-xl border border-border/60 text-muted transition hover:border-brand hover:bg-elevated hover:text-primary"
          onClick={() => onEdit(task)}
          type="button"
          whileHover={{ rotate: -4, scale: 1.04 }}
          whileTap={{ scale: 0.92 }}
        >
          <Pencil aria-hidden className="size-4.5" strokeWidth={1.75} />
        </motion.button>
        <motion.button
          aria-label={t("tasks.actions.deleteNamed", { title: task.title })}
          className="grid size-11 place-items-center rounded-xl border border-border/60 text-muted transition hover:border-danger hover:bg-danger/10 hover:text-danger"
          onClick={() => onDelete(task)}
          type="button"
          whileHover={{ rotate: 4, scale: 1.04 }}
          whileTap={{ scale: 0.92 }}
        >
          <Trash2 aria-hidden className="size-4.5" strokeWidth={1.75} />
        </motion.button>
      </div>
    </motion.article>
  );
}
