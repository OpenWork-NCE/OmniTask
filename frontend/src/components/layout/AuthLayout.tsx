import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { LocaleMenu } from "@/components/ui/LocaleMenu";
import { ThemeMenu } from "@/components/ui/ThemeMenu";

type AuthLayoutProps = PropsWithChildren<{
  variant: "login" | "register";
  eyebrow: string;
  title: string;
  description: string;
}>;

export function AuthLayout({ children, description, eyebrow, title, variant }: AuthLayoutProps) {
  const { t } = useTranslation();
  return (
    <main className={`auth-shell auth-shell-${variant}`}>
      <a className="skip-link" href="#auth-form">
        {t("accessibility.skipToContent")}
      </a>
      <header className="auth-header">
        <BrandLogo className="w-44 sm:w-52" />
        <div className="flex gap-2">
          <LocaleMenu />
          <ThemeMenu />
        </div>
      </header>
      <div className="auth-grid">
        <section className="auth-story" aria-labelledby="auth-story-title">
          <p className="auth-eyebrow">{eyebrow}</p>
          <h2 id="auth-story-title">{t("auth.storyTitle")}</h2>
          <p>{description}</p>
        </section>
        <section className="auth-card" id="auth-form" aria-labelledby="auth-title">
          <div className="grid gap-3">
            <p className="auth-eyebrow lg:hidden">{eyebrow}</p>
            <h1 id="auth-title">{title}</h1>
            <p className="text-muted lg:hidden">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
