import { describe, expect, it } from "vitest";

import { readTaskQuery, writeTaskQuery } from "./task-query-state";

describe("task query state", () => {
  it("round-trips literal search text and bounded pagination", () => {
    const query = readTaskQuery(new URLSearchParams("q=50%25_caf%C3%A9&page=2&size=20"));

    expect(query).toEqual({ q: "50%_café", status: null, page: 2, size: 20 });
    expect(writeTaskQuery(query).toString()).toBe("q=50%25_caf%C3%A9&page=2&size=20");
  });

  it("normalizes invalid filters to safe defaults", () => {
    expect(readTaskQuery(new URLSearchParams("status=ARCHIVED&page=-4&size=999"))).toEqual({
      q: "",
      status: null,
      page: 0,
      size: 20
    });
  });

  it("omits default values from clean URLs", () => {
    expect(writeTaskQuery({ q: "", status: null, page: 0, size: 20 }).toString()).toBe("");
  });
});
