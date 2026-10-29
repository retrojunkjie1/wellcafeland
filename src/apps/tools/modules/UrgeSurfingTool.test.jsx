import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import UrgeSurfingTool from "./UrgeSurfingTool";

const mockLogToolUsage = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: (...args) => mockLogToolUsage(...args) }));
const mockCallAgent = vi.fn();
vi.mock("@/ai/agents/agentClient", () => ({ callAgent: (...args) => mockCallAgent(...args) }));
const mockVoice = vi.hoisted(() => ({
  status: "idle",
  error: "",
  playbackProgress: 0,
  play: vi.fn().mockResolvedValue(true),
  pause: vi.fn().mockResolvedValue(undefined),
  resume: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
}));
vi.mock("@/hooks/useNaturalVoice", () => ({ useNaturalVoice: () => mockVoice }));

afterEach(() => {
  vi.useRealTimers();
  mockLogToolUsage.mockReset().mockResolvedValue(undefined);
  mockCallAgent.mockReset();
  mockVoice.status = "idle";
  mockVoice.error = "";
  mockVoice.playbackProgress = 0;
  mockVoice.play.mockReset().mockResolvedValue(true);
  mockVoice.pause.mockReset().mockResolvedValue(undefined);
  mockVoice.resume.mockReset().mockResolvedValue(undefined);
  mockVoice.stop.mockReset();
});

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
    expect(mockLogToolUsage).toHaveBeenCalledWith("urge_surfing", expect.objectContaining({ context: { completed: true } }));
    expect(JSON.stringify(mockLogToolUsage.mock.calls)).not.toContain("Reach someone safe");
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

  it("shows the selected move's spoken guidance while voice is playing", () => {
    mockVoice.status = "playing";
    render(<UrgeSurfingTool />);

    const moveButton = screen.getByRole("button", { name: /Meet one basic need/ });
    const selectedCard = moveButton.parentElement;
    fireEvent.click(moveButton);
    fireEvent.click(within(selectedCard).getByRole("button", { name: /Take a 3-minute pause/ }));

    expect(screen.getByRole("region", { name: "Your visual guide" })).toHaveTextContent(/If you have not eaten or had water, start there/i);
    expect(mockVoice.play).toHaveBeenCalledWith(expect.stringContaining("If you have not eaten or had water"));
  });

  it("asks Compass with only the selected value and move, then shows an optional suggestion", async () => {
    mockCallAgent.mockResolvedValueOnce({
      summary: "You chose rest as something that matters.",
      value: "Rest",
      choice: "A familiar task can be small and unhurried.",
      nextStep: "Put on one familiar song if you want to.",
    });
    render(<UrgeSurfingTool />);
    fireEvent.click(screen.getByText(/Explore the pattern and choose what matters next/i));
    fireEvent.change(screen.getByRole("textbox", { name: /What behavior are you weighing\? \(optional\)/i }), { target: { value: "private reflection that stays on this screen" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /Rest/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getAllByRole("button", { name: /Start a familiar task/ })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Ask Compass for a suggestion" }));

    expect(await screen.findByText("A familiar task can be small and unhurried.")).toBeInTheDocument();
    expect(mockCallAgent).toHaveBeenCalledTimes(1);
    expect(mockCallAgent).toHaveBeenCalledWith("compass", { values: ["Rest"], selectedMove: "hands-busy" });
    expect(mockCallAgent).not.toHaveBeenCalledWith("compass", expect.objectContaining({ behavior: expect.anything() }));
  });

  it("keeps the chosen move available when the optional Compass request fails", async () => {
    mockCallAgent.mockRejectedValueOnce(new Error("network detail must stay hidden"));
    render(<UrgeSurfingTool />);
    fireEvent.click(screen.getByText(/Explore the pattern and choose what matters next/i));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /Rest/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getAllByRole("button", { name: /Start a familiar task/ })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Ask Compass for a suggestion" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/Compass couldn’t prepare a suggestion right now/i);
    expect(screen.getByRole("button", { name: "Use this move" })).toBeEnabled();
    expect(screen.queryByText("network detail must stay hidden")).not.toBeInTheDocument();
  });
});
