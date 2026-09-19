import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { AppProviders } from "@/app/AppProviders";
import { appRoutes } from "@/app/router";
import {
  clearSession,
  readSession,
  sessionFromAccessToken,
  writeSession
} from "@/features/auth/session/session";
import { request } from "@/lib/api/http";
import { setLocale } from "@/lib/i18n/i18n";
import { server } from "@/test/server";

function renderApp(initialEntry: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [initialEntry] });
  render(
    <AppProviders queryClient={new QueryClient()}>
      <RouterProvider router={router} />
    </AppProviders>
  );
  return router;
}

function validSession() {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1_000) + 900 }));
  const session = sessionFromAccessToken(`header.${payload}.signature`);
  if (!session) throw new Error("Test token must create a session");
  return session;
}

afterEach(async () => {
  clearSession();
  await setLocale("en");
});

describe("login flow", () => {
  it("shows localized field errors and focuses email on invalid login", async () => {
    await setLocale("fr");
    const user = userEvent.setup();
    renderApp("/login");

    await user.click(await screen.findByRole("button", { name: "Se connecter" }));

    expect(screen.getByLabelText("Adresse e-mail")).toHaveFocus();
    expect(screen.getByText("Saisissez votre adresse e-mail.")).toBeVisible();
  });

  it("returns to the protected destination after login", async () => {
    const user = userEvent.setup();
    const router = renderApp("/app/tasks?q=report");

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeVisible();
    await user.type(screen.getByLabelText("Email address"), "alex@example.com");
    await user.type(screen.getByLabelText("Password"), "a-strong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/app/tasks"));
    expect(router.state.location.search).toBe("?q=report");
    expect(readSession()).not.toBeNull();
  });

  it("clears a rejected protected session and explains the expiry", async () => {
    writeSession(validSession());
    server.use(
      http.get("http://localhost:8080/api/tasks", () =>
        HttpResponse.json(
          { status: 401, code: "UNAUTHENTICATED", detail: "Authentication is required" },
          { status: 401, headers: { "Content-Type": "application/problem+json" } }
        )
      )
    );
    renderApp("/app/tasks");
    expect(await screen.findByRole("heading", { name: "Tasks" })).toBeVisible();

    await request("/api/tasks").catch(() => undefined);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeVisible();
    expect(screen.getByText("Your session has expired")).toBeVisible();
    expect(readSession()).toBeNull();
  });
});
