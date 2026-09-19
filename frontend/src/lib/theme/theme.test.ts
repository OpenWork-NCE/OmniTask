import { describe, expect, it } from "vitest";

import { resolveTheme } from "./theme";

describe("theme resolution", () => {
  it("resolves system theme changes without overwriting the preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  it("keeps explicit theme preferences", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});
