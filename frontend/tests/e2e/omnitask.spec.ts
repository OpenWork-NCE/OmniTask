import { expect, test } from "@playwright/test";

import { createAccount, createTask, login } from "./support/api-fixtures";

test("registers and creates the first task on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/register");
  const unique = `${String(Date.now())}-${crypto.randomUUID()}`;
  const credentials = {
    email: `mobile-${unique}@example.com`,
    password: `OmniTask-${unique}`
  };

  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Your account is ready. Sign in to continue.")).toBeVisible();
  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/app\/tasks/);

  await createTask(page, "Prepare mobile review");

  await expect(page.getByText("Prepare mobile review", { exact: true })).toBeVisible();
  expect(
    await page.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth)
  ).toBe(true);
});

test("edits and filters tasks on desktop", async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const credentials = await createAccount(request);
  await login(page, credentials);
  await createTask(page, "Quarterly report");

  await page.getByRole("button", { name: "Edit task Quarterly report" }).click();
  await page.getByLabel("Status", { exact: true }).selectOption("DONE");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Task updated")).toBeVisible();
  await page.getByRole("button", { name: /Task status/ }).click();
  await page.getByRole("option", { name: "Done" }).click();

  await expect(page).toHaveURL(/status=DONE/);
  await expect(page.getByText("Quarterly report", { exact: true })).toBeVisible();
});

test("browser back restores literal search text", async ({ page, request }) => {
  const credentials = await createAccount(request);
  await login(page, credentials);
  const search = page.getByLabel("Search tasks");

  await search.fill("50%_café");
  await expect(page).toHaveURL(/q=50%25_caf%C3%A9/);
  await search.fill("second search");
  await expect(page).toHaveURL(/q=second\+search/);
  await page.goBack();

  await expect(search).toHaveValue("50%_café");
});

test("persists French and dark theme at narrow zoomed layout", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.goto("/login");

  await page.getByRole("button", { name: "Language" }).click();
  await page.getByRole("menuitem", { name: "French" }).click();
  await page.getByRole("button", { name: "Thème de couleur" }).click();
  await page.getByRole("menuitem", { name: "Sombre" }).click();
  await page.reload();
  await page.locator("html").evaluate((element) => {
    element.style.fontSize = "200%";
  });

  await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.locator("html").evaluate((element) => element.scrollWidth <= element.clientWidth)
  ).toBe(true);
});
