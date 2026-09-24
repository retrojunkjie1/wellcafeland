import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import DailyCheckInPage from "./DailyCheckInPage";

vi.mock("@/components/CheckIn", () => ({
  default: ({ onComplete }) => (
    <button type="button" onClick={() => onComplete({ completed: true })}>
      Complete check-in
    </button>
  ),
}));

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
}

describe("daily check-in next step", () => {
  it("offers optional grounding and breathing routes after completion", () => {
    render(
      <MemoryRouter>
        <DailyCheckInPage />
        <CurrentPath />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /complete check-in/i }));

    expect(screen.getByRole("heading", { name: /your check-in is saved/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try grounding/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try breathing/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /i’m done for now/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /try grounding/i }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/tools/grounding");
  });
});
