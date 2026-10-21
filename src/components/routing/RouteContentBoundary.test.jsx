import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import RouteContentBoundary from "./RouteContentBoundary";

function Screen({ shouldCrash, message = "Private technical failure detail" }) {
  if (shouldCrash) throw new Error(message);
  return <p>Recovered screen</p>;
}

describe("RouteContentBoundary", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("keeps the failure on the screen and offers working escape paths", () => {
    vi.stubEnv("DEV", false);
    render(
      <RouteContentBoundary resetKey="first-route">
        <Screen shouldCrash />
      </RouteContentBoundary>,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to Home" }).getAttribute("href")).toBe("/home");
    expect(screen.getByRole("link", { name: "Get support" }).getAttribute("href")).toBe("/support");
    expect(screen.getByRole("button", { name: "Try this screen again" })).toBeTruthy();
    expect(screen.queryByText("Private technical failure detail")).toBeNull();
  });

  it("retries the current screen and resets after route navigation", () => {
    const { rerender } = render(
      <RouteContentBoundary resetKey="first-route">
        <Screen shouldCrash />
      </RouteContentBoundary>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Try this screen again" }));
    expect(screen.getByRole("alert")).toBeTruthy();

    rerender(
      <RouteContentBoundary resetKey="second-route">
        <Screen shouldCrash={false} />
      </RouteContentBoundary>,
    );
    expect(screen.getByText("Recovered screen")).toBeTruthy();
  });

  it("keeps technical details available during development only", () => {
    vi.stubEnv("DEV", true);
    render(
      <RouteContentBoundary resetKey="first-route">
        <Screen shouldCrash />
      </RouteContentBoundary>,
    );

    expect(screen.getByText("Developer details")).toBeTruthy();
    expect(screen.getByText("Private technical failure detail")).toBeTruthy();
  });
});
