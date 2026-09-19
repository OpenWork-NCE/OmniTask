import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

type TaskPaginationProps = Readonly<{
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}>;

export function TaskPagination({ onPageChange, page, totalPages }: TaskPaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-4" aria-label={t("pagination.label")}>
      <button
        aria-label={t("pagination.previous")}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 font-bold disabled:opacity-40"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        <ChevronLeft aria-hidden className="size-4" />
        <span className="hidden sm:inline">{t("pagination.previous")}</span>
      </button>
      <p className="text-sm font-semibold text-muted">
        {t("pagination.page", { current: page + 1, total: totalPages })}
      </p>
      <button
        aria-label={t("pagination.next")}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 font-bold disabled:opacity-40"
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        <span className="hidden sm:inline">{t("pagination.next")}</span>
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </nav>
  );
}
