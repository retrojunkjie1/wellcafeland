import { describe, expect, it } from "vitest";
import { classifyProviderRequestFailure } from "./providerRequestFailure";

describe("classifyProviderRequestFailure", () => {
  it("keeps explicit App Check failures separate from sign-in failures", () => {
    expect(classifyProviderRequestFailure({ code: "APP_CHECK_REQUIRED" })).toBe("app-check");
    expect(classifyProviderRequestFailure({ code: "functions/unauthenticated" })).toBe("auth");
  });

  it("identifies permission failures without treating them as expired sign-in", () => {
    expect(classifyProviderRequestFailure({ code: "permission-denied" })).toBe("access");
    expect(classifyProviderRequestFailure({ code: "functions/unauthorized" })).toBe("access");
  });

  it("uses a general load failure for errors without an explicit auth boundary", () => {
    expect(classifyProviderRequestFailure(new Error("temporary outage"))).toBe("load");
  });
});
