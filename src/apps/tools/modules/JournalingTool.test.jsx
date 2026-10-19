import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import JournalingTool from "./JournalingTool";

const { callAgent } = vi.hoisted(() => ({ callAgent: vi.fn() }));

vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));
vi.mock("@/firebase", () => ({ db: null }));
vi.mock("@/hooks/useSessionIdentity", () => ({
  useSessionIdentity: () => ({ userId: null, mode: "guest" }),
}));
vi.mock("@/utils/toolContract", () => ({
  createToolResult: vi.fn(),
  safeComplete: vi.fn(),
  safeCancel: vi.fn(),
}));
vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/hooks/useNaturalVoice", () => ({
  useNaturalVoice: () => ({
    status: "idle",
    playbackProgress: 0,
    play: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
  }),
}));

describe("JournalingTool Scribe assist", () => {
  beforeEach(() => callAgent.mockReset());

  it("requests a fresh prompt using only the selected mode and keeps entry text local", async () => {
    callAgent.mockResolvedValue({
      result: {
        summary: "A gentle starting point.",
        prompt: "What would help you feel a little more supported right now?",
        followUp: "What is one small way to make room for that?",
      },
    });
    render(<JournalingTool />);

    fireEvent.click(screen.getByRole("button", { name: /Name what is here/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Journal entry" }), {
      target: { value: "PRIVATE ENTRY: please do not share this text" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Suggest a fresh prompt" }));

    expect(await screen.findByText("What would help you feel a little more supported right now?")).toBeInTheDocument();
    expect(callAgent).toHaveBeenCalledOnce();
    expect(callAgent).toHaveBeenCalledWith("scribe", {
      question: expect.stringContaining('The person selected the journaling mode "Name what is here"'),
    });
    expect(JSON.stringify(callAgent.mock.calls)).not.toContain("PRIVATE ENTRY");

    fireEvent.click(screen.getByRole("button", { name: "Use this question" }));
    expect(screen.getByRole("textbox", { name: "Journal entry" })).toHaveValue(
      "PRIVATE ENTRY: please do not share this text\n\nWhat would help you feel a little more supported right now?\n",
    );
  });

  it("keeps spoken guidance and Scribe available in embedded Journal", async () => {
    callAgent.mockResolvedValue({ result: { prompt: "What feels worth noticing today?" } });
    render(<JournalingTool isEmbedded />);

    fireEvent.click(screen.getByRole("button", { name: /Clear the page/ }));
    expect(screen.getByRole("region", { name: "Spoken journaling prompts" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Suggest a fresh prompt" }));

    expect(await screen.findByText("What feels worth noticing today?")).toBeInTheDocument();
  });

  it("sends journal text to Mirror only after an explicit request and does not add its response to the entry", async () => {
    callAgent.mockResolvedValue({
      result: {
        summary: "An optional reflection.",
        reflection: "You wrote that rest felt difficult to ask for.",
        question: "What would feel like a kind next step?",
      },
    });
    render(<JournalingTool />);
    fireEvent.click(screen.getByRole("button", { name: /Look back with care/ }));
    const entry = screen.getByRole("textbox", { name: "Journal entry" });
    fireEvent.change(entry, { target: { value: "Rest felt difficult to ask for." } });

    fireEvent.click(screen.getByRole("button", { name: "Reflect this back" }));

    expect(await screen.findByText("You wrote that rest felt difficult to ask for.")).toBeInTheDocument();
    expect(callAgent).toHaveBeenCalledOnce();
    expect(callAgent).toHaveBeenCalledWith("mirror", { content: "Rest felt difficult to ask for." });
    expect(entry).toHaveValue("Rest felt difficult to ask for.");
  });
});
