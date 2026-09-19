import { beforeEach, describe, expect, it } from "vitest";

import {
  SESSION_KEY,
  clearSession,
  readSession,
  sessionFromAccessToken,
  writeSession
} from "./session";

function createToken(payload: object) {
  const encodedPayload = btoa(JSON.stringify(payload))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `header.${encodedPayload}.signature`;
}

describe("session storage", () => {
  beforeEach(() => sessionStorage.clear());

  it("clears an expired restored session", () => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ accessToken: createToken({ exp: 1 }), expiresAt: 1 })
    );

    expect(readSession()).toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("persists a valid session only for the browser tab", () => {
    const session = { accessToken: createToken({ exp: 2_000 }), expiresAt: 2_000_000 };

    writeSession(session);

    expect(readSession(1_000_000)).toEqual(session);
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    clearSession();
    expect(readSession(1_000_000)).toBeNull();
  });

  it("derives the expiry from a valid JWT exp claim", () => {
    expect(sessionFromAccessToken(createToken({ exp: 2_000 }))).toEqual({
      accessToken: createToken({ exp: 2_000 }),
      expiresAt: 2_000_000
    });
  });

  it("rejects malformed tokens and expiry claims", () => {
    expect(sessionFromAccessToken("not-a-jwt")).toBeNull();
    expect(sessionFromAccessToken(createToken({ exp: "tomorrow" }))).toBeNull();
  });
});
