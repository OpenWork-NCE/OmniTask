import { env } from "@/lib/config/env";

import { readSession } from "@/features/auth/session/session";

import { toApiProblem } from "./problem";

export type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  authenticated?: boolean;
};

export type HttpClientDependencies = Readonly<{
  apiBaseUrl: string;
  getAccessToken: () => string | null;
}>;

export function createHttpClient(dependencies: HttpClientDependencies) {
  return async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { authenticated = true, ...init } = options;
    const headers = new Headers(init.headers);
    const token = authenticated ? dependencies.getAccessToken() : null;

    headers.set("Accept", "application/json, application/problem+json");
    if (init.body != null && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(new URL(path, dependencies.apiBaseUrl), {
      ...init,
      headers
    });

    if (!response.ok) throw await toApiProblem(response);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  };
}

export const request = createHttpClient({
  apiBaseUrl: env.apiBaseUrl,
  getAccessToken: () => readSession()?.accessToken ?? null
});
