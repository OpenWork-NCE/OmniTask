import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createHttpClient } from "./http";

const server = setupServer();
const request = createHttpClient({
  apiBaseUrl: "https://api.omnitask.test",
  getAccessToken: () => "access-token"
});

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

describe("HTTP client", () => {
  it("converts Problem Details into a typed failure", async () => {
    server.use(
      http.get("https://api.omnitask.test/api/tasks", () =>
        HttpResponse.json(
          {
            status: 422,
            code: "VALIDATION_FAILED",
            detail: "The request contains invalid fields.",
            correlationId: "request-123",
            errors: [{ field: "title", message: "must not be blank" }]
          },
          {
            status: 422,
            headers: { "Content-Type": "application/problem+json" }
          }
        )
      )
    );

    await expect(request("/api/tasks")).rejects.toMatchObject({
      status: 422,
      code: "VALIDATION_FAILED",
      correlationId: "request-123"
    });
  });

  it("converts Problem Details without leaking an HTML response", async () => {
    server.use(
      http.get(
        "https://api.omnitask.test/api/tasks",
        () => new HttpResponse("<h1>Gateway</h1>", { status: 502 })
      )
    );

    await expect(request("/api/tasks")).rejects.toMatchObject({
      status: 502,
      code: "HTTP_ERROR",
      detail: "The service could not complete the request."
    });
  });

  it("adds JSON and bearer headers without overriding caller headers", async () => {
    server.use(
      http.post("https://api.omnitask.test/api/tasks", ({ request: intercepted }) => {
        expect(intercepted.headers.get("authorization")).toBe("Bearer access-token");
        expect(intercepted.headers.get("content-type")).toBe("application/json");
        expect(intercepted.headers.get("x-client")).toBe("web");
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(
      request<undefined>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "Ship the release" }),
        headers: { "X-Client": "web" }
      })
    ).resolves.toBeUndefined();
  });
});
