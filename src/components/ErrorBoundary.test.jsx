import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ErrorBoundary, { needsPageReload } from "./ErrorBoundary";

vi.mock("@/telemetry/telemetry", () => ({ trackError: vi.fn() }));

function CrashingChild({ shouldCrash, message = "This panel failed to render." }) {
  if (shouldCrash) throw new Error(message);
  return <p>Recovered content</p>;
}

describe("ErrorBoundary recovery", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("offers a true page reload for stale lazy-loaded chunks", () => {
    expect(needsPageReload(new TypeError("Failed to fetch dynamically imported module"))).toBe(true);
    expect(needsPageReload(new Error("Loading chunk 42 failed"))).toBe(true);
    expect(needsPageReload(new Error("This panel failed to render."))).toBe(false);

    render(<ErrorBoundary><CrashingChild shouldCrash message="Failed to fetch dynamically imported module" /></ErrorBoundary>);
    expect(screen.getByRole("button", { name: "Reload page" })).toBeTruthy();
  });

  it("lets an ordinary component failure retry locally", () => {
    const { rerender } = render(<ErrorBoundary><CrashingChild shouldCrash /></ErrorBoundary>);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();

    rerender(<ErrorBoundary><CrashingChild shouldCrash={false} /></ErrorBoundary>);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("Recovered content")).toBeTruthy();
  });
});
