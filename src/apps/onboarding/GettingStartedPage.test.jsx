import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import GettingStartedPage from "./GettingStartedPage";

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="current-location">{location.pathname}{location.search}</output>;
}

describe("GettingStartedPage", () => {
  it("starts a real walkthrough on the home screen instead of repeating dashboard links", () => {
    render(<MemoryRouter initialEntries={["/getting-started"]}><GettingStartedPage /><LocationProbe /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "See how WellnessCafe works" })).toBeTruthy();
    expect(screen.getByText(/point out the real controls as you move through them/i)).toBeTruthy();
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByText(/Talk it through|Daily Practice|Find real-world help/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Start the walkthrough/ }));
    expect(screen.getByTestId("current-location").textContent).toBe("/home?tour=home");
  });
});
