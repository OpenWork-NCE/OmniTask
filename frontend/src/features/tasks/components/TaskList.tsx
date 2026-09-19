import { motion, useReducedMotion } from "framer-motion";

import type { Task } from "../api/task-types";
import { TaskItem } from "./TaskItem";

type TaskListProps = Readonly<{
  tasks: readonly Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}>;

export function TaskList({ onDelete, onEdit, tasks }: TaskListProps) {
  return (
    <motion.div
      animate="visible"
      aria-live="polite"
      className="grid gap-3"
      initial="hidden"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.045 } }
      }}
    >
      {tasks.map((task) => (
        <TaskItem key={task.id} onDelete={onDelete} onEdit={onEdit} task={task} />
      ))}
    </motion.div>
  );
}

export function TaskListSkeleton() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: 5 }, (_, index) => (
        <motion.div
          animate={reduceMotion ? {} : { opacity: [0.55, 0.85, 0.55] }}
          key={index}
          className="h-28 rounded-2xl border border-border/30 bg-surface opacity-70 md:h-24"
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
        />
      ))}
    </div>
  );
}
