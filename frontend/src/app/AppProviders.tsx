import * as Toast from "@radix-ui/react-toast";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import type { PropsWithChildren } from "react";

import { SessionProvider } from "@/features/auth/session/SessionProvider";
import { i18n } from "@/lib/i18n/i18n";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

import { queryClient as applicationQueryClient } from "./query-client";

type AppProvidersProps = PropsWithChildren<{ queryClient?: QueryClient }>;

export function AppProviders({
  children,
  queryClient = applicationQueryClient
}: AppProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <Toast.Provider swipeDirection="right">
              {children}
              <Toast.Viewport className="fixed right-4 bottom-4 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-3 outline-none" />
            </Toast.Provider>
          </SessionProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
