import { QueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { AppProviders } from "@/app/AppProviders";
import { appRoutes } from "@/app/router";
import {
  clearSession,
  sessionFromAccessToken,
  writeSession
} from "@/features/auth/session/session";
import { server } from "@/test/server";

function authenticate() {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1_000) + 900 }));
  const session = sessionFromAccessToken(`header.${payload}.signature`);
  if (!session) throw new Error("Test token must create a session");
  writeSession(session);
}

function renderTasks(entry: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [entry] });
  render(
    <AppProviders queryClient={new QueryClient()}>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

afterEach(() => clearSession());

describe("task workspace", () => {
  it("restores filters from the URL and renders the API total", async () => {
    authenticate();
    server.use(
      http.get("http://localhost:8080/api/tasks", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("status")).toBe("DONE");
        expect(url.searchParams.get("q")).toBe("report");
        expect(url.searchParams.get("page")).toBe("1");
        expect(url.searchParams.get("size")).toBe("20");
        return HttpResponse.json({
          items: [
            {
              id: "fdbf3694-5055-4a0a-a337-2425c37f2fa8",
              title: "Publish quarterly report",
              description: "Share the reviewed report with leadership.",
              status: "DONE",
              createdAt: "2026-09-18T10:00:00Z",
              updatedAt: "2026-09-19T09:00:00Z",
              version: 3
            }
          ],
          page: 1,
          size: 20,
          totalElements: 24,
          totalPages: 2
        });
      })
    );

    renderTasks("/app/tasks?status=DONE&q=report&page=1&size=20");

    expect(await screen.findByDisplayValue("report")).toBeVisible();
    expect(screen.getByRole("button", { name: /Done/ })).toBeVisible();
    expect(await screen.findByText("24 tasks")).toBeVisible();
    expect(screen.getByText("Publish quarterly report")).toBeVisible();
  });
});
