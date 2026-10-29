import { describe, expect, it, vi } from "vitest";
import { BREATHKEEPER_QUESTION, requestBreathkeeperCue } from "./breathkeeperGuidance";

const { callAgent } = vi.hoisted(() => ({ callAgent: vi.fn() }));
vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));

describe("Breathkeeper guidance request", () => {
  it("requests one cue using only the fixed gentle 4–6 practice specification", async () => {
    callAgent.mockResolvedValue({ result: { invitation: "Let the chair support you as you begin." } });

    await expect(requestBreathkeeperCue()).resolves.toBe("Let the chair support you as you begin.");
    expect(callAgent).toHaveBeenCalledOnce();
    expect(callAgent).toHaveBeenCalledWith("breathkeeper", { question: BREATHKEEPER_QUESTION });
    expect(BREATHKEEPER_QUESTION).toContain("fixed 4-second inhale and 6-second exhale");
    expect(BREATHKEEPER_QUESTION).toContain("Do not change or narrate the timed rhythm");
  });

  it("rejects empty or excessively long agent guidance", async () => {
    callAgent.mockResolvedValue({ result: { invitation: " " } });
    await expect(requestBreathkeeperCue()).rejects.toThrow("short, usable cue");
    callAgent.mockResolvedValue({ result: { invitation: "x".repeat(241) } });
    await expect(requestBreathkeeperCue()).rejects.toThrow("short, usable cue");
  });
});
