import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GroundingTool from "./GroundingTool";
import { logToolUsage } from "@/services/toolTelemetry";

const { callAgent, voicePlay } = vi.hoisted(() => ({ callAgent: vi.fn(), voicePlay: vi.fn() }));

vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));
vi.mock("@/hooks/useNaturalVoice", () => ({
  useNaturalVoice: () => ({
    status: "idle",
    playbackProgress: 0,
    play: voicePlay,
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
  }),
}));
vi.mock("@/utils/toolContract", () => ({
  createToolResult: vi.fn((toolId, title, summary, data) => ({ toolId, title, summary, data })),
  safeComplete: vi.fn((callback, result) => callback?.(result)),
  safeCancel: vi.fn((callback) => callback?.()),
}));

describe("GroundingTool", () => {
  it("offers an optional Anchor wording based only on the chosen cue and includes it in voice only by choice", async () => {
    callAgent.mockResolvedValue({
      result: {
        summary: "A tactile grounding option.",
        invitation: "Notice one small detail in the object's surface.",
        nextStep: "Set it down whenever you are ready.",
      },
    });
    render(<GroundingTool />);

    fireEvent.click(screen.getByText("Hold a familiar object").closest("button"));
    fireEvent.click(screen.getByRole("button", { name: "Suggest a wording" }));

    expect(await screen.findByText("Notice one small detail in the object's surface.")).toBeInTheDocument();
    expect(callAgent).toHaveBeenCalledOnce();
    expect(callAgent).toHaveBeenCalledWith("anchor", {
      question: expect.stringContaining('selected this grounding anchor: "Touch"'),
    });
    expect(JSON.stringify(callAgent.mock.calls)).not.toContain("private");

    fireEvent.click(screen.getByRole("button", { name: "Include this in spoken guidance" }));
    fireEvent.click(screen.getByRole("button", { name: "Begin this pause" }));
    expect(voicePlay).toHaveBeenCalledOnce();
    expect(voicePlay.mock.calls[0][0]).toContain("Notice one small detail in the object's surface.");
    expect(voicePlay.mock.calls[0][0]).toContain("hold a familiar object and notice its weight or texture");
  });

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
