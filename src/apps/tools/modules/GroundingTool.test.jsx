import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GroundingTool from "./GroundingTool";
import { logToolUsage } from "@/services/toolTelemetry";

vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: vi.fn().mockResolvedValue(undefined) }));

describe("GroundingTool", () => {
  it("offers a visual room reference and a small set of optional grounding cues", () => {
    render(<GroundingTool />);

    expect(screen.getByRole("region", { name: "Interactive 360 room tour" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Choose a grounding cue" })).toBeInTheDocument();
    expect(screen.getByText("Look")).toBeInTheDocument();
    expect(screen.getByText("Listen")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Finish pause/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("keeps the chosen cue optional, completes once, and offers a try-another path", () => {
    const onComplete = vi.fn();
    render(<GroundingTool onComplete={onComplete} />);

    fireEvent.click(screen.getByText("Hold a familiar object").closest("button"));
    expect(screen.getByText(/hold a familiar object and notice its weight or texture/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Begin this pause" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Begin this pause" })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Begin this pause" }));
    expect(screen.getByText(/hold a familiar object and notice its weight or texture/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finish pause" }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].title).toBe("Reconnect with the room");
    expect(onComplete.mock.calls[0][0].data).toEqual({ practiceType: "choice-led-orientation" });
    expect(logToolUsage).toHaveBeenCalledOnce();
    expect(logToolUsage.mock.calls[0][1].context).toEqual({ completed: true });

    expect(screen.getByRole("heading", { name: "You made a moment for yourself." })).toBeInTheDocument();
    expect(screen.getByText(/No score or particular feeling is expected/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try another cue" }));
    expect(screen.getByRole("group", { name: "Choose a grounding cue" })).toBeInTheDocument();
  });

  it("offers a clear way to leave without completing", () => {
    const onCancel = vi.fn();
    render(<GroundingTool onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Leave practice" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
