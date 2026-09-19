import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("routes an anonymous visitor to login", async () => {
    window.history.replaceState({}, "", "/");
    render(<App />);

    const heading = await screen.findByRole("heading", { name: "Sign in" });
    await waitFor(() => expect(heading).toBeVisible());
  });
});
