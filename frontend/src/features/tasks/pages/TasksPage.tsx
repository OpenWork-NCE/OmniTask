import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ToastRegion } from "@/components/ui/ToastRegion";
import { isApiProblem } from "@/lib/api/problem";

import { createTask, deleteTask, listTasks, updateTask } from "../api/tasks-api";
import type { Task, TaskQuery, TaskStatus } from "../api/task-types";
import { DeleteTaskDialog } from "../components/DeleteTaskDialog";
import { TaskEditorDialog } from "../components/TaskEditorDialog";
import { TaskList, TaskListSkeleton } from "../components/TaskList";
import { TaskPagination } from "../components/TaskPagination";
import { TaskToolbar } from "../components/TaskToolbar";
import { TasksEmptyState } from "../components/TasksEmptyState";
import { readTaskQuery, writeTaskQuery } from "../query/task-query-state";
import type { TaskFormValues } from "../schemas/task-schema";

export function TasksPage() {
  const { i18n, t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editorTask, setEditorTask] = useState<Task | null | undefined>();
  const [deleteSelection, setDeleteSelection] = useState<Task | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const serializedSearch = searchParams.toString();
  const query = useMemo(
    () => readTaskQuery(new URLSearchParams(serializedSearch)),
    [serializedSearch]
  );
  const tasks = useQuery({
    queryKey: ["tasks", query],
    queryFn: ({ signal }) => listTasks(query, signal)
  });
  const saveMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const input = {
        title: values.title,
        description: values.description === "" ? null : values.description,
        status: values.status
      };
      return editorTask
        ? updateTask(editorTask.id, { ...input, version: editorTask.version })
        : createTask(input);
    }
  });
  const deleteMutation = useMutation({ mutationFn: deleteTask });

  function updateQuery(update: Partial<TaskQuery>, replace = false) {
    setSearchParams(writeTaskQuery({ ...query, ...update }), { replace });
  }

  function changeStatus(status: TaskStatus | null) {
    updateQuery({ status, page: 0 });
  }

  function closeEditor() {
    if (saveMutation.isPending) return;
    setEditorTask(undefined);
    setEditorError(null);
    setConflict(false);
  }

  async function save(values: TaskFormValues) {
    setEditorError(null);
    setConflict(false);
    try {
      const wasEditing = Boolean(editorTask);
      await saveMutation.mutateAsync(values);
      setEditorTask(undefined);
      setToast(t(wasEditing ? "toasts.taskUpdated" : "toasts.taskCreated"));
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      if (isApiProblem(error) && error.code === "TASK_VERSION_CONFLICT") {
        setConflict(true);
        setEditorError(t("errors.conflict"));
      } else {
        setEditorError(t("errors.generic"));
      }
    }
  }

  async function reloadAfterConflict() {
    setEditorTask(undefined);
    setEditorError(null);
    setConflict(false);
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  async function confirmDelete() {
    if (!deleteSelection) return;
    try {
      await deleteMutation.mutateAsync(deleteSelection.id);
      setDeleteSelection(null);
      setToast(t("toasts.taskDeleted"));
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      setDeleteSelection(null);
      setToast(
        isApiProblem(error) && error.status === 404 ? t("errors.taskMissing") : t("errors.generic")
      );
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  }

  return (
    <AppShell>
      <main
        id="main-content"
        className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        <motion.header
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
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
        </motion.header>
        <TaskToolbar
          search={query.q}
          status={query.status}
          onSearchChange={(q) => updateQuery({ q, page: 0 })}
          onStatusChange={changeStatus}
          onCreate={() => {
            setEditorError(null);
            setConflict(false);
            setEditorTask(null);
          }}
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
        {tasks.data?.items.length ? (
          <TaskList
            tasks={tasks.data.items}
            onEdit={(task) => {
              setEditorError(null);
              setConflict(false);
              setEditorTask(task);
            }}
            onDelete={setDeleteSelection}
          />
        ) : null}
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
      {editorTask !== undefined ? (
        <TaskEditorDialog
          key={editorTask?.id ?? "create"}
          conflict={conflict}
          error={editorError}
          onClose={closeEditor}
          onReload={() => void reloadAfterConflict()}
          onSubmit={save}
          open
          pending={saveMutation.isPending}
          task={editorTask}
        />
      ) : null}
      <DeleteTaskDialog
        onCancel={() => setDeleteSelection(null)}
        onConfirm={() => void confirmDelete()}
        pending={deleteMutation.isPending}
        task={deleteSelection}
      />
      <ToastRegion message={toast} onDismiss={() => setToast(null)} />
    </AppShell>
  );
}
