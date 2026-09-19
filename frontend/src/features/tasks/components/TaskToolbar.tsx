import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import matrixOverlay from "@/assets/overlays/matrix-light.svg";

import type { TaskStatus } from "../api/task-types";

type TaskToolbarProps = Readonly<{
  search: string;
  status: TaskStatus | null;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | null) => void;
  onCreate?: (() => void) | undefined;
}>;

const statuses: readonly (TaskStatus | null)[] = [null, "TODO", "IN_PROGRESS", "DONE"];
const labels = {
  null: "status.all",
  TODO: "status.todo",
  IN_PROGRESS: "status.inProgress",
  DONE: "status.done"
} as const;

export function TaskToolbar({
  onCreate,
  onSearchChange,
  onStatusChange,
  search,
  status
}: TaskToolbarProps) {
  const { t } = useTranslation();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    clearTimeout(timer.current);
  }, [search]);

  function debounceSearch(value: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearchChange(value), 300);
  }

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-border/40 bg-surface p-4 shadow-sm sm:p-5">
      <img
        aria-hidden
        alt=""
        src={matrixOverlay}
        className="absolute inset-0 -z-10 size-full object-cover opacity-[0.035] dark:invert"
      />
      <div className="grid gap-3 md:grid-cols-[minmax(16rem,1fr)_13rem_auto]">
        <label className="relative block">
          <span className="sr-only">{t("tasks.search.label")}</span>
          <Search
            aria-hidden
            className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
          />
          <input
            key={search}
            className="min-h-12 w-full rounded-xl border border-border bg-surface/95 pr-4 pl-12 text-primary shadow-sm placeholder:text-muted/70 focus:border-brand"
            defaultValue={search}
            maxLength={200}
            onChange={(event) => debounceSearch(event.currentTarget.value)}
            placeholder={t("tasks.search.placeholder")}
            type="search"
          />
        </label>
        <Listbox value={status} onChange={onStatusChange}>
          <div className="relative">
            <ListboxButton
              aria-label={`${t("status.label")}: ${t(labels[String(status) as keyof typeof labels])}`}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface/95 px-4 text-left font-semibold shadow-sm hover:border-brand"
            >
              <span>{t(labels[String(status) as keyof typeof labels])}</span>
              <ChevronDown aria-hidden className="size-4 text-muted" />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom start"
              transition
              className="z-50 mt-2 w-(--button-width) rounded-xl border border-border/60 bg-surface p-1.5 text-primary shadow-2xl transition duration-150 data-closed:scale-95 data-closed:opacity-0"
            >
              {statuses.map((option) => (
                <ListboxOption
                  key={option ?? "all"}
                  value={option}
                  className="flex min-h-10 cursor-pointer items-center justify-between rounded-lg px-3 font-semibold data-focus:bg-elevated"
                >
                  {({ selected }) => (
                    <>
                      {t(labels[String(option) as keyof typeof labels])}
                      {selected ? <Check aria-hidden className="size-4 text-brand" /> : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        {onCreate ? (
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-bold text-on-brand shadow-lg transition hover:brightness-110"
            onClick={onCreate}
            type="button"
          >
            <Plus aria-hidden className="size-5" />
            {t("tasks.actions.create")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
