import { QueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("creates a task and refreshes the active list", async () => {
    authenticate();
    const createdTask = {
      id: "c42bb426-ce65-4ee4-af4e-b8ce44a73799",
      title: "Prepare review",
      description: null,
      status: "TODO",
      createdAt: "2026-09-19T10:00:00Z",
      updatedAt: "2026-09-19T10:00:00Z",
      version: 0
    };
    let items: object[] = [];
    server.use(
      http.get("http://localhost:8080/api/tasks", () =>
        HttpResponse.json({ items, page: 0, size: 20, totalElements: items.length, totalPages: 1 })
      ),
      http.post("http://localhost:8080/api/tasks", async ({ request }) => {
        expect(await request.json()).toMatchObject({ title: "Prepare review", description: null });
        items = [createdTask];
        return HttpResponse.json(createdTask, { status: 201 });
      })
    );
    const user = userEvent.setup();
    renderTasks("/app/tasks");

    await user.click(await screen.findByRole("button", { name: "Create a task" }));
    await user.type(screen.getByLabelText("Title"), "Prepare review");
    await user.click(screen.getByRole("button", { name: "Save task" }));

    expect(await screen.findByText("Task created")).toBeVisible();
    expect(await screen.findByText("Prepare review")).toBeVisible();
  });

  it("keeps a stale edit open and offers reload or cancel", async () => {
    authenticate();
    const task = {
      id: "74eb7b9d-25bb-4c7b-b70e-ea9105588b27",
      title: "Prepare review",
      description: null,
      status: "IN_PROGRESS",
      createdAt: "2026-09-18T10:00:00Z",
      updatedAt: "2026-09-19T09:00:00Z",
      version: 2
    };
    server.use(
      http.get("http://localhost:8080/api/tasks", () =>
        HttpResponse.json({ items: [task], page: 0, size: 20, totalElements: 1, totalPages: 1 })
      ),
      http.put("http://localhost:8080/api/tasks/:id", () =>
        HttpResponse.json(
          { status: 409, code: "TASK_VERSION_CONFLICT", detail: "Task changed" },
          { status: 409, headers: { "Content-Type": "application/problem+json" } }
        )
      )
    );
    const user = userEvent.setup();
    renderTasks("/app/tasks");

    await user.click(await screen.findByRole("button", { name: "Edit task Prepare review" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("This task changed elsewhere");
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByRole("button", { name: "Reload task list" })).toBeVisible();
  });

  it("requires delete confirmation and restores focus when cancelled", async () => {
    authenticate();
    const task = {
      id: "58b4d6b9-e1ee-423f-889f-848ffed07333",
      title: "Archive notes",
      description: null,
      status: "DONE",
      createdAt: "2026-09-18T10:00:00Z",
      updatedAt: "2026-09-19T09:00:00Z",
      version: 1
    };
    let items: object[] = [task];
    server.use(
      http.get("http://localhost:8080/api/tasks", () =>
        HttpResponse.json({ items, page: 0, size: 20, totalElements: items.length, totalPages: 1 })
      ),
      http.delete("http://localhost:8080/api/tasks/:id", () => {
        items = [];
        return new HttpResponse(null, { status: 204 });
      })
    );
    const user = userEvent.setup();
    renderTasks("/app/tasks");
    const deleteButton = await screen.findByRole("button", { name: "Delete task Archive notes" });

    await user.click(deleteButton);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(deleteButton).toHaveFocus();
    await user.click(deleteButton);
    await user.click(screen.getByRole("button", { name: "Delete task" }));

    expect(await screen.findByText("Task deleted")).toBeVisible();
    expect(screen.queryByText("Archive notes")).not.toBeInTheDocument();
  });
});
