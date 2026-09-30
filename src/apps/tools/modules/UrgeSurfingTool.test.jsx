import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import UrgeSurfingTool from "./UrgeSurfingTool";

vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: vi.fn().mockResolvedValue(undefined) }));

afterEach(() => vi.useRealTimers());

describe("UrgeSurfingTool", () => {
  it("offers practical choices instead of intensity ratings or a written assessment", () => {
    render(<UrgeSurfingTool />);

    expect(screen.getByText(/choose one useful next move/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Put a little space between me and it/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bring another person in/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Give my hands something else to do/ })).toBeInTheDocument();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Find real-world support/ })).toHaveAttribute("href", "/assistance");
  });

  it("shows the practical cue inside the selected card and completes without saving the choice", () => {
    const onComplete = vi.fn();
    render(<UrgeSurfingTool onComplete={onComplete} />);

    const reachOutButton = screen.getByRole("button", { name: /Bring another person in/ });
    const selectedCard = reachOutButton.parentElement;
    fireEvent.click(reachOutButton);

    expect(within(selectedCard).getByRole("region", { name: "Bring another person in" })).toHaveTextContent(/Could you stay with me or talk for a few minutes/i);
    fireEvent.click(within(selectedCard).getByRole("button", { name: "Done for now" }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].title).toBe("Urge Support");
    expect(onComplete.mock.calls[0][0].data).toEqual({ practiceType: "choice-led-urge-support" });
  });

  it("offers a short optional pause that can be paused and ended early", () => {
    vi.useFakeTimers();
    render(<UrgeSurfingTool />);

    const moveButton = screen.getByRole("button", { name: /Give my hands something else to do/ });
    const selectedCard = moveButton.parentElement;
    fireEvent.click(moveButton);
    fireEvent.click(within(selectedCard).getByRole("button", { name: /Take a 3-minute pause/ }));

    expect(within(selectedCard).getByRole("timer")).toHaveTextContent("3:00");
    expect(within(selectedCard).getByText(/does not predict how the urge will change/i)).toBeInTheDocument();

    fireEvent.click(within(selectedCard).getByRole("button", { name: "Pause" }));
    act(() => vi.advanceTimersByTime(2000));
    expect(within(selectedCard).getByRole("timer")).toHaveTextContent("3:00");

    fireEvent.click(within(selectedCard).getByRole("button", { name: "Done for now" }));
  });
});
