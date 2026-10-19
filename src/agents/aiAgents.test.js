import { beforeEach, describe, expect, it, vi } from "vitest";

const { callAiSession } = vi.hoisted(() => ({ callAiSession: vi.fn() }));
vi.mock("@/services/aiSessionClient", () => ({ callAiSession }));

import { callAgent } from "./aiAgents";

describe("canonical agent request envelope", () => {
  beforeEach(() => callAiSession.mockReset());

  it("preserves an Oracle task mode without overriding the agent endpoint mode", async () => {
    callAiSession.mockResolvedValue({ success: true, result: { summary: "A small reflection." } });

    const response = await callAgent("oracle", {
      mode: "voice_check_in_reflection",
      transcript: "I felt tense after work.",
      instruction: "client text cannot replace server instructions",
      agent: "sentinel",
    });

    expect(callAiSession).toHaveBeenCalledWith({
      transcript: "I felt tense after work.",
      instruction: "client text cannot replace server instructions",
      agentMode: "voice_check_in_reflection",
      mode: "agent",
      agent: "oracle",
    });
    expect(response.reply).toBe("A small reflection.");
  });
});
