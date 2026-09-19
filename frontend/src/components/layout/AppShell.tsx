import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { motion } from "framer-motion";
import { LogOut, UserRound } from "lucide-react";
import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { useSession } from "@/features/auth/session/session-context";
import { AbstractMotionLayer } from "@/components/motion/AbstractMotionLayer";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LocaleMenu } from "@/components/ui/LocaleMenu";
import { ThemeMenu } from "@/components/ui/ThemeMenu";

export function AppShell({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const { logout } = useSession();
  return (
    <div className="app-shell min-h-dvh bg-canvas text-primary">
      <AbstractMotionLayer variant="matrix" />
      <a className="skip-link" href="#main-content">
        {t("accessibility.skipToContent")}
      </a>
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 border-b border-border/40 bg-surface/90 backdrop-blur-xl"
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandLogo className="w-40 sm:w-48" />
          <div className="flex items-center gap-2">
            <LocaleMenu />
            <ThemeMenu />
            <Menu as="div" className="relative">
              <MenuButton
                aria-label={t("navigation.account")}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border/70 bg-surface text-primary shadow-sm transition hover:bg-elevated"
              >
                <UserRound aria-hidden className="size-5" strokeWidth={1.75} />
              </MenuButton>
              <MenuItems
                anchor="bottom end"
                className="z-50 mt-2 w-48 rounded-xl border border-border/60 bg-surface p-1.5 text-primary shadow-2xl"
              >
                <MenuItem>
                  <button
                    className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left font-semibold data-focus:bg-elevated"
                    onClick={logout}
                    type="button"
                  >
                    <LogOut aria-hidden className="size-4 text-muted" />
                    {t("navigation.signOut")}
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </motion.header>
      {children}
    </div>
  );
}
