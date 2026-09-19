import { motion, useReducedMotion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

import interlock from "@/assets/fragments/interlock.svg";

export function TasksEmptyState({ filtered }: Readonly<{ filtered: boolean }>) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="relative isolate grid min-h-80 place-items-center overflow-hidden rounded-3xl border border-border/40 bg-surface p-8 text-center shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        aria-hidden
        animate={reduceMotion ? {} : { rotate: [0, 3, 0], scale: [1, 1.035, 1] }}
        className="absolute -right-12 -bottom-20 -z-10 w-80 opacity-15"
        src={interlock}
        alt=""
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
      />
      <div className="grid max-w-lg justify-items-center gap-3">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
          <SearchX aria-hidden className="size-7" strokeWidth={1.75} />
        </span>
        <h2 className="font-display text-xl font-extrabold sm:text-2xl">
          {t(filtered ? "tasks.empty.filteredTitle" : "tasks.empty.title")}
        </h2>
        <p className="text-muted">
          {t(filtered ? "tasks.empty.filteredDescription" : "tasks.empty.description")}
        </p>
      </div>
    </motion.section>
  );
}
