import { request } from "@/lib/api/http";

import type { CreateTaskInput, Task, TaskPage, TaskQuery, UpdateTaskInput } from "./task-types";

export function listTasks(query: TaskQuery, signal?: AbortSignal): Promise<TaskPage> {
  const search = new URLSearchParams();
  if (query.q) search.set("q", query.q);
  if (query.status) search.set("status", query.status);
  search.set("page", String(query.page));
  search.set("size", String(query.size));
  return request<TaskPage>(`/api/tasks?${search.toString()}`, signal ? { signal } : {});
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) });
}

export function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  return request<Task>(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export function deleteTask(id: string): Promise<undefined> {
  return request<undefined>(`/api/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
}
