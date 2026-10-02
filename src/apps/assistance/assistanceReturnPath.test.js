import { describe, expect, it } from "vitest";
import { getPracticeReturnPath } from "./assistanceReturnPath";

describe("assistance practice return path", () => {
  it("allows only a local tool-detail route", () => {
    expect(getPracticeReturnPath({ returnTo: "/tools/grounding" })).toBe("/tools/grounding");
    expect(getPracticeReturnPath({ returnTo: "https://example.com" })).toBe("");
    expect(getPracticeReturnPath({ returnTo: "//example.com" })).toBe("");
    expect(getPracticeReturnPath({ returnTo: "/admin/console" })).toBe("");
  });
});
