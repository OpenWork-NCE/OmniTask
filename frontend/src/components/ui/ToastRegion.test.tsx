import * as Toast from "@radix-ui/react-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";

import { i18n, setLocale } from "@/lib/i18n/i18n";

import { ToastRegion } from "./ToastRegion";

it("dismisses a notification from its close button", async () => {
  const dismiss = vi.fn();
  await setLocale("en");

  render(
    <I18nextProvider i18n={i18n}>
      <Toast.Provider>
        <ToastRegion message="Task created" onDismiss={dismiss} />
        <Toast.Viewport />
      </Toast.Provider>
    </I18nextProvider>
  );

  fireEvent.click(screen.getByRole("button", { name: "Close" }));

  expect(dismiss).toHaveBeenCalled();
});
