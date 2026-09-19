import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";

import { listTasks } from "../api/tasks-api";
import type { TaskQuery, TaskStatus } from "../api/task-types";
import { TaskList, TaskListSkeleton } from "../components/TaskList";
import { TaskPagination } from "../components/TaskPagination";
import { TaskToolbar } from "../components/TaskToolbar";
import { TasksEmptyState } from "../components/TasksEmptyState";
import { readTaskQuery, writeTaskQuery } from "../query/task-query-state";

export function TasksPage() {
  const { i18n, t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const serializedSearch = searchParams.toString();
  const query = useMemo(
    () => readTaskQuery(new URLSearchParams(serializedSearch)),
    [serializedSearch]
  );
  const tasks = useQuery({
    queryKey: ["tasks", query],
    queryFn: ({ signal }) => listTasks(query, signal)
  });

  function updateQuery(update: Partial<TaskQuery>, replace = false) {
    setSearchParams(writeTaskQuery({ ...query, ...update }), { replace });
  }

  function changeStatus(status: TaskStatus | null) {
    updateQuery({ status, page: 0 });
  }

  return (
    <AppShell>
      <main
        id="main-content"
        className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        <header className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold tracking-[0.15em] text-brand uppercase">
              {t("tasks.eyebrow")}
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
              {t("tasks.title")}
            </h1>
            <p className="mt-3 text-lg text-muted">{t("tasks.description")}</p>
          </div>
          {tasks.data ? (
            <p className="text-sm font-bold text-muted">
              {t("tasks.count", {
                count: tasks.data.totalElements,
                formattedCount: new Intl.NumberFormat(i18n.resolvedLanguage).format(
                  tasks.data.totalElements
                )
              })}
            </p>
          ) : null}
        </header>
        <TaskToolbar
          search={query.q}
          status={query.status}
          onSearchChange={(q) => updateQuery({ q, page: 0 }, true)}
          onStatusChange={changeStatus}
        />
        {tasks.isPending ? <TaskListSkeleton /> : null}
        {tasks.isError ? (
          <section
            className="grid justify-items-start gap-4 rounded-2xl border border-danger/30 bg-surface p-6"
            role="alert"
          >
            <p className="font-semibold text-danger">{t("errors.network")}</p>
            <Button variant="secondary" onClick={() => void tasks.refetch()}>
              {t("tasks.actions.retry")}
            </Button>
          </section>
        ) : null}
        {tasks.data?.items.length ? <TaskList tasks={tasks.data.items} /> : null}
        {tasks.data?.items.length === 0 ? (
          <TasksEmptyState filtered={Boolean(query.q || query.status)} />
        ) : null}
        {tasks.data ? (
          <TaskPagination
            page={tasks.data.page}
            totalPages={tasks.data.totalPages}
            onPageChange={(page) => updateQuery({ page })}
          />
        ) : null}
      </main>
    </AppShell>
  );
}
