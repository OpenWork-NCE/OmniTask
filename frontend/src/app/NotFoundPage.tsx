import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { BrandLogo } from "@/components/ui/BrandLogo";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-canvas px-5 py-12 text-primary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgb(49_89_219/0.18),transparent_38%)]" />
      <section className="relative grid max-w-2xl justify-items-start gap-6 rounded-3xl border border-border/50 bg-surface/95 p-8 shadow-2xl sm:p-12">
        <BrandLogo className="w-44" />
        <p className="font-display text-sm font-bold tracking-[0.2em] text-brand">
          {t("notFound.eyebrow")}
        </p>
        <h1 className="font-display text-3xl leading-tight font-extrabold sm:text-5xl">
          {t("notFound.title")}
        </h1>
        <p className="max-w-xl text-lg text-muted">{t("notFound.description")}</p>
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-on-brand"
          to="/"
        >
          <ArrowLeft aria-hidden className="size-5" />
          {t("notFound.action")}
        </Link>
      </section>
    </main>
  );
}
