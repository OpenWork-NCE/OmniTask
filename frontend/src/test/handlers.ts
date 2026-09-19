import { HttpResponse, http } from "msw";

function accessToken() {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1_000) + 900 }))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `header.${payload}.signature`;
}

export const handlers = [
  http.post("http://localhost:8080/api/auth/login", () =>
    HttpResponse.json({ accessToken: accessToken(), tokenType: "Bearer", expiresIn: 900 })
  ),
  http.post("http://localhost:8080/api/auth/register", () =>
    HttpResponse.json(
      {
        id: "e783627d-906d-4ea1-81da-1f3b26f8c670",
        email: "alex@example.com",
        createdAt: "2026-09-19T10:00:00Z"
      },
      { status: 201 }
    )
  )
];
