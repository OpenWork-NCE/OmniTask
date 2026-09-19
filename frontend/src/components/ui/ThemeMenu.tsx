import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Check, Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ThemePreference } from "@/lib/theme/theme";
import { useTheme } from "@/lib/theme/theme-context";

const icons = { system: Monitor, light: Sun, dark: Moon } as const;

export function ThemeMenu() {
  const { t } = useTranslation();
  const { preference, setPreference } = useTheme();
  const choices: readonly ThemePreference[] = ["system", "light", "dark"];

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border/70 bg-surface/90 text-primary shadow-sm backdrop-blur transition hover:bg-elevated"
        aria-label={t("accessibility.theme")}
      >
        <SunMoon aria-hidden className="size-5" strokeWidth={1.75} />
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        transition
        className="z-50 mt-2 w-44 origin-top-right rounded-xl border border-border/60 bg-surface p-1.5 text-primary shadow-2xl transition duration-150 data-closed:scale-95 data-closed:opacity-0"
      >
        {choices.map((choice) => {
          const Icon = icons[choice];
          return (
            <MenuItem key={choice}>
              <button
                className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left font-semibold data-focus:bg-elevated"
                onClick={() => setPreference(choice)}
                type="button"
              >
                <Icon aria-hidden className="size-4 text-muted" />
                <span className="flex-1">{t(`theme.${choice}`)}</span>
                {preference === choice ? <Check aria-hidden className="size-4 text-brand" /> : null}
              </button>
            </MenuItem>
          );
        })}
      </MenuItems>
    </Menu>
  );
}
