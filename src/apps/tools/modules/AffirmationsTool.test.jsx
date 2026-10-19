import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import AffirmationsTool from "./AffirmationsTool";

const mocks = vi.hoisted(() => ({
  callAgent: vi.fn(),
  logToolUsage: vi.fn(),
  trackAction: vi.fn(),
}));

vi.mock("@/ai/agents/agentClient", () => ({ callAgent: mocks.callAgent }));
vi.mock("../../../services/toolTelemetry", () => ({ logToolUsage: mocks.logToolUsage }));
vi.mock("../../../services/telemetry", () => ({ trackAction: mocks.trackAction }));
vi.mock("@/components/tools/ToolCharacterGuide", () => ({ default: () => null }));
vi.mock("@/hooks/useNaturalVoice", () => ({
  useNaturalVoice: () => ({ status: "idle", error: null, playbackProgress: 0, play: vi.fn(), pause: vi.fn(), resume: vi.fn(), stop: vi.fn() }),
}));

const generatedPhrases = [
  "I can take one moment at a time.",
  "I may ask for support while I work through this.",
  "One difficult moment does not define all of me.",
  "I can choose a next step that feels manageable.",
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.callAgent.mockResolvedValue({ result: { summary: "Optional phrases to adapt or leave.", phrases: generatedPhrases } });
  mocks.logToolUsage.mockResolvedValue(undefined);
});
afterEach(() => cleanup());

describe("AffirmationsTool and Healer", () => {
  it("sends only the explicitly selected concern and renders the structured phrases", async () => {
    render(<AffirmationsTool tool={{ id: "affirmations" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Shame" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate Affirmations" }));

    expect(mocks.callAgent).toHaveBeenCalledWith("healer", { concern: "shame" });
    expect((await screen.findAllByText("I can take one moment at a time.")).length).toBeGreaterThan(0);
    expect(screen.getByText((_, element) => element?.tagName === "SPAN" && element.textContent.replace(/\s/g, "") === "1/4")).toBeInTheDocument();
    expect(mocks.logToolUsage).toHaveBeenCalledWith("affirmations", expect.objectContaining({ context: { count: 4 } }));
    expect(JSON.stringify(mocks.logToolUsage.mock.calls)).not.toContain("shame");
  });

  it("keeps usable local starter phrases when the response is incomplete", async () => {
    mocks.callAgent.mockResolvedValue({ result: { summary: "Incomplete", phrases: ["Only one optional phrase."] } });
    render(<AffirmationsTool tool={{ id: "affirmations" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Generate Affirmations" }));

    expect(await screen.findByText(/couldn’t prepare a complete set/)).toBeInTheDocument();
    expect((await screen.findAllByText("I can take this one moment at a time.")).length).toBeGreaterThan(0);
  });
});
