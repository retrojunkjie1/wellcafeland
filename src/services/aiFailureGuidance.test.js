import { describe, expect, it } from "vitest";
import { getAIServiceFailureActions } from "./aiFailureGuidance";

describe("AI service failure actions", () => {
  it("keeps ordinary and emotional support requests out of the resource directory", () => {
    for (const routeIntent of ["UNKNOWN", "ALWAYS_ON_SUPPORT"]) {
      const actions = getAIServiceFailureActions({ routeIntent });
      expect(actions).toEqual([
        { label: "Retry", action: "retry" },
        { label: "Continue offline", action: "offline" },
      ]);
      expect(actions.some((action) => action.action === "open_directory")).toBe(false);
    }
  });

  it("offers support search only when the person asked for local resources", () => {
    expect(getAIServiceFailureActions({ routeIntent: "DIRECTORY" })).toEqual([
      { label: "Retry", action: "retry" },
      { label: "Open support search", action: "open_directory" },
    ]);
  });

  it("directs a failed appointment or connection request toward practitioners", () => {
    expect(getAIServiceFailureActions({ routeIntent: "RESTRICTED" })).toEqual([
      { label: "Retry", action: "retry" },
      { label: "Browse practitioners", action: "open_practitioners" },
    ]);
  });

  it("does not offer retry when the failure cannot be retried", () => {
    expect(getAIServiceFailureActions({ routeIntent: "UNKNOWN", retryable: false })).toEqual([
      { label: "Continue offline", action: "offline" },
    ]);
  });
});
