import { motion } from "framer-motion";
import { CircleCheck, CircleDashed, Timer } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { TaskStatus } from "../api/task-types";

const styles = {
  TODO: "border-slate-400/30 bg-slate-500/10 text-muted",
  IN_PROGRESS: "border-blue-500/30 bg-blue-500/10 text-brand",
  DONE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
} as const;

const icons = { TODO: CircleDashed, IN_PROGRESS: Timer, DONE: CircleCheck } as const;
const labels = {
  TODO: "status.todo",
  IN_PROGRESS: "status.inProgress",
  DONE: "status.done"
} as const;

export function TaskStatusBadge({ status }: Readonly<{ status: TaskStatus }>) {
  const { t } = useTranslation();
  const Icon = icons[status];
  return (
    <motion.span
      layout
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${styles[status]}`}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Icon aria-hidden className="size-3.5" />
      {t(labels[status])}
    </motion.span>
  );
}
