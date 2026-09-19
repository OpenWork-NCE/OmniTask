import type { TaskQuery, TaskStatus } from "../api/task-types";

export const DEFAULT_TASK_PAGE_SIZE = 20;
const MAX_PAGE = 1_000_000;
const MAX_PAGE_SIZE = 100;
const statuses: readonly TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

function boundedInteger(value: string | null, minimum: number, maximum: number, fallback: number) {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
}

export function readTaskQuery(search: URLSearchParams): TaskQuery {
  const status = search.get("status");
  return {
    q: search.get("q") ?? "",
    status: statuses.includes(status as TaskStatus) ? (status as TaskStatus) : null,
    page: boundedInteger(search.get("page"), 0, MAX_PAGE, 0),
    size: boundedInteger(search.get("size"), 1, MAX_PAGE_SIZE, DEFAULT_TASK_PAGE_SIZE)
  };
}

export function writeTaskQuery(query: TaskQuery): URLSearchParams {
  const search = new URLSearchParams();
  if (query.q) search.set("q", query.q);
  if (query.status) search.set("status", query.status);
  if (query.page > 0) search.set("page", String(query.page));
  if (query.size !== DEFAULT_TASK_PAGE_SIZE || query.page > 0)
    search.set("size", String(query.size));
  return search;
}
