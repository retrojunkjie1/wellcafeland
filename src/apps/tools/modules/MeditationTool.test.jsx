import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MeditationTool from "./MeditationTool";

vi.mock("../../../services/toolTelemetry", () => ({ logToolUsage: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../../../services/telemetry", () => ({ trackAction: vi.fn() }));

afterEach(() => vi.useRealTimers());

describe("MeditationTool visual pause", () => {
  it("offers distinct, offline-ready scenes instead of an AI breathing fallback", () => {
    render(<MeditationTool tool={{ id: "meditation", name: "Visualization & Imagery" }} />);

    expect(screen.getByRole("button", { name: /A wide sky/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rain on a window/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /A familiar place/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Color and light/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ask Oracle/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Focus on your breath/)).not.toBeInTheDocument();
  });

  it("keeps the chosen cue visible during pause, resumes, and can finish early", () => {
    const onComplete = vi.fn();
    render(<MeditationTool tool={{ id: "meditation", name: "Visualization & Imagery" }} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /Rain on a window/ }));
    fireEvent.click(screen.getByRole("button", { name: "Begin" }));
    expect(screen.getByRole("heading", { name: "Set the scene" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByText(/Paused · Rain on a window/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Set the scene" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    fireEvent.click(screen.getByRole("button", { name: /Next step/ }));
    expect(screen.getByRole("heading", { name: "Choose one small detail" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Finish now" }));
    expect(screen.getByRole("heading", { name: "Your pause is complete" })).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].data.sceneId).toBe("rain-window");
  });

  it("completes once when the optional timer reaches zero", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<MeditationTool tool={{ id: "meditation", name: "Visualization & Imagery" }} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: "3 min" }));
    fireEvent.click(screen.getByRole("button", { name: "Begin" }));

    act(() => vi.advanceTimersByTime(3 * 60 * 1000));

    expect(screen.getByRole("heading", { name: "Your pause is complete" })).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("records active practice time without counting time spent paused", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));
    const onComplete = vi.fn();
    render(<MeditationTool tool={{ id: "meditation", name: "Visualization & Imagery" }} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: "Begin" }));

    act(() => vi.advanceTimersByTime(30_000));
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => vi.advanceTimersByTime(5 * 60_000));
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    act(() => vi.advanceTimersByTime(20_000));
    fireEvent.click(screen.getByRole("button", { name: "Finish now" }));

    const { logToolUsage } = await import("../../../services/toolTelemetry");
    expect(logToolUsage).toHaveBeenCalledWith("meditation", expect.objectContaining({ durationMs: 50_000 }));
    expect(onComplete.mock.calls[0][0].durationSeconds).toBe(50);
  });
});
