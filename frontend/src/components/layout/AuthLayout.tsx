import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { AbstractMotionLayer } from "@/components/motion/AbstractMotionLayer";
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
      <AbstractMotionLayer variant={variant === "login" ? "horizon" : "eclipse"} />
      <a className="skip-link" href="#auth-form">
        {t("accessibility.skipToContent")}
      </a>
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="auth-header"
        initial={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <BrandLogo className="w-44 sm:w-52" />
        <div className="flex gap-2">
          <LocaleMenu />
          <ThemeMenu />
        </div>
      </motion.header>
      <div className="auth-grid">
        <motion.section
          animate="visible"
          aria-labelledby="auth-story-title"
          className="auth-story"
          initial="hidden"
          variants={{
            hidden: {},
            visible: { transition: { delayChildren: 0.1, staggerChildren: 0.08 } }
          }}
        >
          <motion.p
            className="auth-eyebrow"
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          >
            {eyebrow}
          </motion.p>
          <motion.h2
            id="auth-story-title"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            {t("auth.storyTitle")}
          </motion.h2>
          <motion.p variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
            {description}
          </motion.p>
        </motion.section>
        <motion.section
          animate={{ opacity: 1, y: 0, scale: 1 }}
          aria-labelledby="auth-title"
          className="auth-card"
          id="auth-form"
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          transition={{ delay: 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid gap-3">
            <p className="auth-eyebrow lg:hidden">{eyebrow}</p>
            <h1 id="auth-title">{title}</h1>
            <p className="text-muted lg:hidden">{description}</p>
          </div>
          {children}
        </motion.section>
      </div>
    </main>
  );
}
