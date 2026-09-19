import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  ...(process.env.CI
    ? {
        workers: 1,
        retries: 1,
        reporter: [["line"], ["html", { open: "never" }]] as const
      }
    : { retries: 0, reporter: "line" as const }),
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5173",
    url: "http://localhost:5173/login",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
