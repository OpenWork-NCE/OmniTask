import { useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { readThemePreference, resolveTheme, writeThemePreference } from "./theme";
import { ThemeContext, type ThemeContextValue } from "./theme-context";
const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

export function ThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState(readThemePreference);
  const [systemDark, setSystemDark] = useState(() => matchMedia(DARK_MODE_QUERY).matches);
  const resolvedTheme = resolveTheme(preference, systemDark);

  useEffect(() => {
    const mediaQuery = matchMedia(DARK_MODE_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolvedTheme,
      setPreference: (nextPreference) => {
        writeThemePreference(nextPreference);
        setPreferenceState(nextPreference);
      }
    }),
    [preference, resolvedTheme]
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
