import { describe, expect, it } from "vitest";
import { getPracticeReturnPath, getPracticeReturnTarget } from "./assistanceReturnPath";

describe("assistance practice return path", () => {
  it("allows only a local tool-detail route", () => {
    expect(getPracticeReturnPath({ returnTo: "/tools/grounding" })).toBe("/tools/grounding");
    expect(getPracticeReturnPath({ returnTo: "https://example.com" })).toBe("");
    expect(getPracticeReturnPath({ returnTo: "//example.com" })).toBe("");
    expect(getPracticeReturnPath({ returnTo: "/admin/console" })).toBe("");
  });

  it("keeps query, hash, route state, and scroll position for a valid local practice", () => {
    const returnTo = {
      pathname: "/tools/grounding",
      search: "?anchor=chosen",
      hash: "#next-step",
      state: { from: "tools" },
      scrollY: 240,
    };

    expect(getPracticeReturnTarget({ returnTo })).toEqual(returnTo);
  });

  it("parses legacy local return strings without folding the hash into the query", () => {
    expect(getPracticeReturnTarget({ returnTo: "/tools/grounding?anchor=chosen#next-step" })).toEqual({
      pathname: "/tools/grounding",
      search: "?anchor=chosen",
      hash: "#next-step",
      state: null,
      scrollY: 0,
    });
  });

  it("fails closed for absent, malformed, nested, and non-local practice targets", () => {
    expect(getPracticeReturnTarget(null)).toBeNull();
    expect(getPracticeReturnTarget({ returnTo: "/tools/grounding/54321" })).toBeNull();
    expect(getPracticeReturnTarget({ returnTo: { pathname: "//example.com/tools/grounding" } })).toBeNull();
    expect(getPracticeReturnTarget({ returnTo: { pathname: "/tools/grounding", search: "anchor=chosen" } })).toBeNull();
  });
});
