import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import DailyCheckInPage from "./DailyCheckInPage";
import { getCheckInNextStep } from "./checkInNextStep";

const mocks = vi.hoisted(() => ({ storySuggestionsEnabled: false, savedTo: "account" }));

vi.mock("@/stores/useOSStore", () => ({
  useOSStore: (selector) => selector({ settings: { recoveryStorySuggestionsEnabled: mocks.storySuggestionsEnabled } }),
}));

vi.mock("@/components/CheckIn", () => ({
  GUEST_CHECKINS_STORAGE_KEY: "wellnesscafe:guest-checkins",
  default: ({ onComplete }) => (
    <button type="button" onClick={() => onComplete({ completed: true, cravingStatus: "yes", cravingIntensity: 8, supportNeeded: "Peer recovery support" }, { savedTo: mocks.savedTo })}>
      Complete check-in
    </button>
  ),
}));

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
}

describe("daily check-in next step", () => {
  it("only offers a recovery story after check-in when the person enabled suggestions", () => {
    mocks.storySuggestionsEnabled = true;
    render(
      <MemoryRouter>
        <DailyCheckInPage />
        <CurrentPath />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /complete check-in/i }));
    const storyLink = screen.getByRole("button", { name: /explore a recovery story/i });
    fireEvent.click(storyLink);
    expect(screen.getByTestId("current-path")).toHaveTextContent("/recovery/stories");
    mocks.storySuggestionsEnabled = false;
  });

  it("routes an explicit peer-support choice to recovery meetings and keeps alternatives tucked away", () => {
    render(
      <MemoryRouter>
        <DailyCheckInPage />
        <CurrentPath />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /complete check-in/i }));

    expect(screen.getByRole("heading", { name: /your check-in is saved/i })).toBeInTheDocument();
    expect(screen.getByText("Peer recovery support")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /find a recovery meeting/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open daily practice/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /see other options/i }));
    expect(screen.getByRole("button", { name: /open daily practice/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /find practical support/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /browse practitioners/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check-in history/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /see my milestones/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /i’m done for now/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /find a recovery meeting/i }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/recovery/meetings");
  });

  it("takes a saved check-in directly to the progress and milestone view", () => {
    render(
      <MemoryRouter>
        <DailyCheckInPage />
        <CurrentPath />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /complete check-in/i }));
    fireEvent.click(screen.getByRole("button", { name: /see my milestones/i }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/milestones");
  });

  it("routes only from the stated support preference, not mood or craving ratings", () => {
    expect(getCheckInNextStep("Help finding practical resources").path).toBe("/assistance");
    expect(getCheckInNextStep("Professional support").path).toBe("/providers");
    expect(getCheckInNextStep("Quiet time for myself").path).toBe("/tools");
    expect(getCheckInNextStep("").path).toBe("/guide");
  });

  it("confirms anonymous guest storage truthfully and lets the guest clear it", () => {
    mocks.savedTo = "device";
    localStorage.setItem("wellnesscafe:guest-checkins", JSON.stringify([{ mood: "good" }]));
    render(
      <MemoryRouter>
        <DailyCheckInPage />
        <CurrentPath />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /complete check-in/i }));

    expect(screen.getByRole("heading", { name: /saved on this device/i })).toBeInTheDocument();
    expect(screen.getByText(/stored only in this browser on this device/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /clear guest check-ins from this device/i }));
    expect(localStorage.getItem("wellnesscafe:guest-checkins")).toBeNull();
    mocks.savedTo = "account";
  });
});
