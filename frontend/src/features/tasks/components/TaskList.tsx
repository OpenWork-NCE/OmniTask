import type { Task } from "../api/task-types";
import { TaskItem } from "./TaskItem";

export function TaskList({ tasks }: Readonly<{ tasks: readonly Task[] }>) {
  return (
    <div className="grid gap-3" aria-live="polite">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}

export function TaskListSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-2xl border border-border/30 bg-surface md:h-24"
        />
      ))}
    </div>
  );
}
