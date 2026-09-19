import { request } from "@/lib/api/http";

export type AuthCredentials = Readonly<{ email: string; password: string }>;
export type TokenResponse = Readonly<{
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}>;
export type UserResponse = Readonly<{
  id: string;
  email: string;
  createdAt: string;
}>;

export function login(input: AuthCredentials): Promise<TokenResponse> {
  return request<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
    authenticated: false
  });
}

export function register(input: AuthCredentials): Promise<UserResponse> {
  return request<UserResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
    authenticated: false
  });
}
