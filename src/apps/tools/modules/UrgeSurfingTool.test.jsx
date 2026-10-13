import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import UrgeSurfingTool from "./UrgeSurfingTool";

vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: vi.fn().mockResolvedValue(undefined) }));

afterEach(() => vi.useRealTimers());

describe("UrgeSurfingTool", () => {
  it("offers practical choices and a private optional reflection instead of intensity ratings", () => {
    render(<UrgeSurfingTool />);

    expect(screen.getByText(/Choose one small, safe next step/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create a little distance/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reach someone safe/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start a familiar task/ })).toBeInTheDocument();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /What behavior are you weighing\? \(optional\)/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Find real-world support/ })).toHaveAttribute("href", "/assistance");
  });

  it("shows the practical cue inside the selected card and completes without saving the choice", () => {
    const onComplete = vi.fn();
    render(<UrgeSurfingTool onComplete={onComplete} />);

    const reachOutButton = screen.getByRole("button", { name: /Reach someone safe/ });
    const selectedCard = reachOutButton.parentElement;
    fireEvent.click(reachOutButton);

    expect(within(selectedCard).getByRole("region", { name: "Reach someone safe" })).toHaveTextContent(/Could you stay with me or talk for a few minutes/i);
    fireEvent.click(within(selectedCard).getByRole("button", { name: "Done for now" }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].title).toBe("Urge Support");
    expect(onComplete.mock.calls[0][0].data).toEqual({ practiceType: "choice-led-urge-support" });
  });

  it("offers a short optional pause that can be paused and ended early", () => {
    vi.useFakeTimers();
    render(<UrgeSurfingTool />);

    const moveButton = screen.getByRole("button", { name: /Start a familiar task/ });
    const selectedCard = moveButton.parentElement;
    fireEvent.click(moveButton);
    fireEvent.click(within(selectedCard).getByRole("button", { name: /Take a 3-minute pause/ }));

    expect(within(selectedCard).getByRole("timer")).toHaveTextContent("3:00");
    expect(within(selectedCard).getByText(/This timer marks time for a pause/i)).toBeInTheDocument();

    fireEvent.click(within(selectedCard).getByRole("button", { name: "Pause" }));
    act(() => vi.advanceTimersByTime(2000));
    expect(within(selectedCard).getByRole("timer")).toHaveTextContent("3:00");

    fireEvent.click(within(selectedCard).getByRole("button", { name: "Done for now" }));
  });
});
