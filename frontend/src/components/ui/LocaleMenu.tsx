import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { setLocale, type Locale } from "@/lib/i18n/i18n";

export function LocaleMenu() {
  const { i18n, t } = useTranslation();
  const locale: Locale = i18n.resolvedLanguage === "fr" ? "fr" : "en";
  const choices: readonly { value: Locale; label: string }[] = [
    { value: "en", label: t("language.english") },
    { value: "fr", label: t("language.french") }
  ];

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border/70 bg-surface/90 text-primary shadow-sm backdrop-blur transition hover:bg-elevated"
        aria-label={t("accessibility.language")}
      >
        <Languages aria-hidden className="size-5" strokeWidth={1.75} />
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        transition
        className="z-50 mt-2 w-44 origin-top-right rounded-xl border border-border/60 bg-surface p-1.5 text-primary shadow-2xl transition duration-150 data-closed:scale-95 data-closed:opacity-0"
      >
        {choices.map((choice) => (
          <MenuItem key={choice.value}>
            <button
              className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left font-semibold data-focus:bg-elevated"
              onClick={() => void setLocale(choice.value)}
              type="button"
            >
              {choice.label}
              {locale === choice.value ? <Check aria-hidden className="size-4 text-brand" /> : null}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
