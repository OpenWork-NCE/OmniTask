export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Task = Readonly<{
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
}>;

export type TaskPage = Readonly<{
  items: readonly Task[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}>;

export type TaskQuery = Readonly<{
  q: string;
  status: TaskStatus | null;
  page: number;
  size: number;
}>;

export type CreateTaskInput = Readonly<{
  title: string;
  description: string | null;
  status: TaskStatus;
}>;

export type UpdateTaskInput = CreateTaskInput & Readonly<{ version: number }>;
