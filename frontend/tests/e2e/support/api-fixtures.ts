import type { APIRequestContext, Page } from "@playwright/test";

export type TestCredentials = Readonly<{ email: string; password: string }>;

const apiBaseUrl = process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:8080";

export async function createAccount(request: APIRequestContext): Promise<TestCredentials> {
  const unique = `${String(Date.now())}-${crypto.randomUUID()}`;
  const credentials = {
    email: `e2e-${unique}@example.com`,
    password: `OmniTask-${unique}`
  };
  const response = await request.post(`${apiBaseUrl}/api/auth/register`, { data: credentials });
  if (!response.ok()) throw new Error(`Account fixture failed with ${String(response.status())}`);
  return credentials;
}

export async function login(page: Page, credentials: TestCredentials): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/app\/tasks/);
}

export async function createTask(page: Page, title: string): Promise<void> {
  await page.getByRole("button", { name: "Create a task" }).click();
  await page.getByLabel("Title").fill(title);
  await page.getByRole("button", { name: "Save task" }).click();
  await page.getByText(title, { exact: true }).waitFor();
}
